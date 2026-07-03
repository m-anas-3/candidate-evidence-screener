import { z } from "zod"

import { getCandidateAnalysisAgentConfiguration } from "@/lib/agent/harness"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2_000),
})

const candidateIdSchema = z.uuid()

// Maximum chat history messages sent to the model (user + assistant pairs).
// Keeps context focused and token cost predictable.
const MAX_HISTORY_MESSAGES = 20

export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  // --- Auth ---
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub
  if (authError || !recruiterId) {
    return Response.json({ error: "Sign in to use candidate chat." }, { status: 401 })
  }

  // --- Validate params ---
  const candidateIdResult = candidateIdSchema.safeParse((await params).candidateId)
  if (!candidateIdResult.success) {
    return Response.json({ error: "Invalid candidate ID." }, { status: 400 })
  }
  const candidateId = candidateIdResult.data

  // --- Validate body ---
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return Response.json({ error: "Message is required." }, { status: 400 })
  }

  // --- Load candidate + report (ownership check via recruiter_id on jobs) ---
  const [{ data: candidate, error: candidateError }, { data: report, error: reportError }] =
    await Promise.all([
      supabase
        .from("candidates")
        .select(
          `id, name, resume_text, proposal_text, portfolio_url,
           jobs!inner ( id, recruiter_id, title, description, requirements, must_have_skills )`
        )
        .eq("id", candidateId)
        .eq("jobs.recruiter_id", recruiterId)
        .maybeSingle(),
      supabase
        .from("screening_reports")
        .select("summary, score, recommendation, strengths, weaknesses, matched_skills, missing_skills, review_points, raw_structured_output")
        .eq("candidate_id", candidateId)
        .maybeSingle(),
    ])

  if (candidateError || !candidate) {
    return Response.json({ error: "Candidate not found." }, { status: 404 })
  }

  // --- Load existing chat history ---
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_MESSAGES)

  // --- Save the user message ---
  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ candidate_id: candidateId, role: "user", content: body.message })

  if (insertError) {
    return Response.json({ error: "Message could not be saved." }, { status: 500 })
  }

  // --- Build OpenAI client ---
  let config
  try {
    config = getCandidateAnalysisAgentConfiguration()
  } catch {
    return Response.json({ error: "Chat is not configured." }, { status: 503 })
  }

  const jobValue = candidate.jobs
  const job = Array.isArray(jobValue) ? jobValue[0] : jobValue

  // --- Build system prompt with candidate context ---
  const systemPrompt = buildSystemPrompt(candidate, job, report ?? null)

  // --- Call OpenAI with streaming ---
  const openaiMessages = [
    ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: body.message },
  ]

  const apiKey = (config as { modelIdentifier: string } & { "#apiKey"?: string })
  // Access the private key via the public createModel factory
  const model = config.createModel()
  // @ts-expect-error — accessing internal openai client field to reuse config
  const openaiApiKey: string = model.client?.apiKey ?? model.openAIApiKey ?? ""
  const modelId: string = config.modelIdentifier

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "system", content: systemPrompt }, ...openaiMessages],
      stream: true,
      max_completion_tokens: 1024,
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "unknown error")
    console.error("[chat] OpenAI error:", upstream.status, errText)
    return Response.json({ error: "AI response could not be generated." }, { status: 502 })
  }

  // --- Stream back to client, collect full reply to persist ---
  const encoder = new TextEncoder()
  let fullReply = ""

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (typeof delta === "string" && delta) {
                fullReply += delta
                // Forward raw SSE line to client
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } finally {
        // Persist the complete assistant reply
        if (fullReply.trim()) {
          await supabase
            .from("chat_messages")
            .insert({ candidate_id: candidateId, role: "assistant", content: fullReply.trim() })
            .then(({ error }) => {
              if (error) console.error("[chat] Failed to persist assistant reply:", error.message)
            })
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  })
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

type CandidateRow = {
  name: string
  resume_text: string | null
  proposal_text: string | null
  portfolio_url: string | null
}

type JobRow = {
  title: string
  description: string
  requirements: string
  must_have_skills: string[]
} | null

type ReportRow = {
  summary: string | null
  score: number | null
  recommendation: string | null
  strengths: unknown
  weaknesses: unknown
  matched_skills: unknown
  missing_skills: unknown
  review_points: unknown
} | null

function buildSystemPrompt(
  candidate: CandidateRow,
  job: JobRow,
  report: ReportRow
): string {
  const lines: string[] = [
    "You are a recruiter assistant. You help the recruiter understand a specific candidate by answering questions grounded strictly in the candidate's resume, proposal, and screening report.",
    "",
    "Rules:",
    "- Only answer questions about this candidate and this job.",
    "- Base every answer on the evidence below. If evidence is absent, say so clearly.",
    "- Never make up facts. Never infer protected characteristics.",
    "- Keep answers concise and recruiter-focused.",
    "- Do not generate interview questions unless explicitly asked.",
    "- This is advisory — always remind the recruiter that human judgement is required.",
    "",
    `## Candidate: ${candidate.name}`,
    `## Job: ${job?.title ?? "Unknown"}`,
  ]

  if (job) {
    lines.push("", "### Job Requirements", job.requirements)
    if (job.must_have_skills.length) {
      lines.push("", "### Must-Have Skills", job.must_have_skills.join(", "))
    }
  }

  if (candidate.proposal_text) {
    lines.push("", "### Candidate Proposal", candidate.proposal_text)
  }

  if (candidate.resume_text) {
    // Truncate resume to keep token usage reasonable
    const resume = candidate.resume_text.slice(0, 8_000)
    lines.push("", "### Resume (extracted text)", resume)
    if (candidate.resume_text.length > 8_000) {
      lines.push("[resume truncated for context length]")
    }
  }

  if (report?.summary) {
    lines.push("", "### Screening Report Summary")
    lines.push(`Score: ${report.score ?? "N/A"} / 100`)
    lines.push(`Recommendation: ${report.recommendation ?? "N/A"}`)
    lines.push(report.summary)
  }

  if (report?.matched_skills) {
    lines.push("", "### Matched Skills")
    lines.push(JSON.stringify(report.matched_skills))
  }

  if (report?.missing_skills) {
    lines.push("", "### Missing Must-Have Skills")
    lines.push(JSON.stringify(report.missing_skills))
  }

  if (report?.strengths) {
    lines.push("", "### Observed Strengths")
    lines.push(JSON.stringify(report.strengths))
  }

  if (report?.weaknesses) {
    lines.push("", "### Evidence Gaps")
    lines.push(JSON.stringify(report.weaknesses))
  }

  if (report?.review_points) {
    lines.push("", "### Human Review Points")
    lines.push(JSON.stringify(report.review_points))
  }

  return lines.join("\n")
}
