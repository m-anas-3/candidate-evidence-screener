import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 30 // Chat needs far less than the 60s we had before

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2_000),
})

const candidateIdSchema = z.uuid()

// How many prior turns to send as chat history.
// Each turn = 1 user + 1 assistant message. 8 turns = 16 messages.
// More history adds tokens on every call — 8 is the right balance for
// recruiter Q&A where context doesn't span many turns.
const MAX_HISTORY_TURNS = 8
const MAX_HISTORY_MESSAGES = MAX_HISTORY_TURNS * 2

// Resume is the biggest token cost in the system prompt.
// 6 000 chars gives enough detail for specific follow-up questions
// while keeping cost well below the full 8 000 char limit.
const RESUME_SNIPPET_CHARS = 6_000

// Chat replies should be thorough and recruiter-useful, but not essays.
// 800 tokens gives room for a structured answer with evidence quotes.
const MAX_REPLY_TOKENS = 800

export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  // --- Auth ---
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub
  if (authError || !recruiterId) {
    return Response.json(
      { error: "Sign in to use candidate chat." },
      { status: 401 }
    )
  }

  // --- Validate params ---
  const candidateIdResult = candidateIdSchema.safeParse(
    (await params).candidateId
  )
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

  // --- Model config ---
  // Chat uses a cheap fast model — no tool-use or structured output needed.
  // Falls back to gpt-4.1-nano if the env var is not set.
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim()
  const chatModelId =
    process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4.1-nano"

  if (!openaiApiKey) {
    return Response.json({ error: "Chat is not configured." }, { status: 503 })
  }

  // --- Load candidate + report + history in parallel ---
  // The report is prioritised over the raw resume for the system prompt:
  // it's already a structured evidence summary so the model doesn't need
  // to re-read the full resume text on every message.
  const [
    { data: candidate, error: candidateError },
    { data: report },
    { data: history },
  ] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        `id, name, resume_text, proposal_text, portfolio_url,
         jobs!inner ( recruiter_id, title, requirements, must_have_skills )`
      )
      .eq("id", candidateId)
      .eq("jobs.recruiter_id", recruiterId)
      .maybeSingle(),

    // Only fetch the structured evidence fields — skip raw_structured_output
    // which is large and redundant when we have the summary + skill lists.
    supabase
      .from("screening_reports")
      .select(
        "summary, score, recommendation, matched_skills, missing_skills, strengths, weaknesses, review_points"
      )
      .eq("candidate_id", candidateId)
      .maybeSingle(),

    // Fetch only the last N messages — older turns aren't useful for Q&A
    // and add significant token cost on every request.
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY_MESSAGES),
  ])

  if (candidateError || !candidate) {
    return Response.json({ error: "Candidate not found." }, { status: 404 })
  }

  // history comes back newest-first from the DESC order, so reverse it
  const orderedHistory = (history ?? []).slice().reverse()

  // --- Persist user message ---
  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ candidate_id: candidateId, role: "user", content: body.message })
  if (insertError) {
    return Response.json(
      { error: "Message could not be saved." },
      { status: 500 }
    )
  }

  const jobValue = candidate.jobs
  const job = Array.isArray(jobValue) ? jobValue[0] : jobValue

  // --- Build system prompt ---
  // Strategy: lead with the screening report (already structured evidence),
  // then a shortened resume snippet as fallback for detail questions.
  // We skip the job description body — requirements + must-haves are enough.
  const systemPrompt = buildSystemPrompt(
    candidate,
    job ?? null,
    report ?? null
  )

  // --- Assemble messages ---
  const messages: { role: "user" | "assistant" | "system"; content: string }[] =
    [
      { role: "system", content: systemPrompt },
      ...orderedHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: body.message },
    ]

  // --- Call OpenAI ---
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: chatModelId,
      messages,
      stream: true,
      max_completion_tokens: MAX_REPLY_TOKENS,
      // Temperature 0.5: grounded but natural — avoids robotic one-liners
      temperature: 0.5,
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "unknown")
    console.error("[chat] OpenAI error:", upstream.status, errText)
    return Response.json(
      { error: "AI response could not be generated." },
      { status: 502 }
    )
  }

  // --- Stream to client, accumulate for persistence ---
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

          for (const line of decoder
            .decode(value, { stream: true })
            .split("\n")) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") continue

            try {
              const delta = (
                JSON.parse(payload) as {
                  choices: { delta: { content?: string } }[]
                }
              ).choices[0]?.delta?.content

              if (typeof delta === "string" && delta) {
                fullReply += delta
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
                )
              }
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }
      } finally {
        if (fullReply.trim()) {
          supabase
            .from("chat_messages")
            .insert({
              candidate_id: candidateId,
              role: "assistant",
              content: fullReply.trim(),
            })
            .then(({ error }) => {
              if (error) {
                console.error(
                  "[chat] Failed to persist assistant reply:",
                  error.message
                )
              }
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
// System prompt — optimised for token efficiency
// ---------------------------------------------------------------------------
// Design principle: the screening report is already a structured evidence
// summary. We use it as the primary source and only add a short resume
// snippet as a fallback for detail questions. This cuts ~60% of the tokens
// vs sending the full resume on every request.
// ---------------------------------------------------------------------------

type JobContext = {
  title: string
  requirements: string
  must_have_skills: string[]
} | null

type ReportContext = {
  summary: string | null
  score: number | null
  recommendation: string | null
  matched_skills: unknown
  missing_skills: unknown
  strengths: unknown
  weaknesses: unknown
  review_points: unknown
} | null

function buildSystemPrompt(
  candidate: {
    name: string
    resume_text: string | null
    proposal_text: string | null
  },
  job: JobContext,
  report: ReportContext
): string {
  const parts: string[] = [
    "You are an expert recruiter assistant helping a hiring professional evaluate a specific candidate.",
    "",
    "Your job is to give thorough, useful answers that draw directly on the evidence provided below.",
    "When answering:",
    "- Quote or paraphrase specific evidence from the resume, proposal, or screening report to support your points.",
    "- Structure longer answers with short sections or bullet points so they are easy to scan.",
    "- If the evidence is strong, say so and explain why. If it is weak or absent, say that clearly.",
    "- Never fabricate facts. Never infer protected characteristics or personal traits.",
    "- Do not generate interview questions unless explicitly asked.",
    "- End with a brief advisory note that the recruiter should verify before making any decision.",
    "",
    `Candidate: ${candidate.name}`,
    job ? `Role: ${job.title}` : "",
  ]

  if (job?.requirements) {
    parts.push("", `Requirements: ${job.requirements.slice(0, 600)}`)
  }

  if (job?.must_have_skills.length) {
    parts.push(`Must-haves: ${job.must_have_skills.join(", ")}`)
  }

  // Report first — it's the most token-efficient evidence source
  if (report?.summary) {
    parts.push(
      "",
      "## Screening Report",
      `Score: ${report.score ?? "N/A"}/100 · Recommendation: ${report.recommendation ?? "N/A"}`,
      report.summary
    )
  }

  if (report?.matched_skills) {
    parts.push("Matched skills: " + slim(report.matched_skills))
  }

  if (report?.missing_skills) {
    parts.push("Missing must-haves: " + slim(report.missing_skills))
  }

  if (report?.strengths) {
    parts.push("Strengths: " + slim(report.strengths))
  }

  if (report?.weaknesses) {
    parts.push("Evidence gaps: " + slim(report.weaknesses))
  }

  if (report?.review_points) {
    parts.push("Review points: " + slim(report.review_points))
  }

  // Proposal — short, usually under 500 chars
  if (candidate.proposal_text) {
    parts.push(
      "",
      "## Proposal",
      candidate.proposal_text.slice(0, 1_000)
    )
  }

  // Resume — truncated; the report already covers the key evidence
  if (candidate.resume_text) {
    const snippet = candidate.resume_text.slice(0, RESUME_SNIPPET_CHARS)
    parts.push("", "## Resume (excerpt)", snippet)
    if (candidate.resume_text.length > RESUME_SNIPPET_CHARS) {
      parts.push("[truncated]")
    }
  }

  return parts.filter(Boolean).join("\n")
}

// Serialise evidence arrays into a compact single-line string so they don't
// bloat the prompt with JSON indentation.
function slim(value: unknown): string {
  try {
    if (!Array.isArray(value)) return JSON.stringify(value)
    return (value as { claim?: string }[])
      .map((item) => item?.claim ?? JSON.stringify(item))
      .join(" | ")
  } catch {
    return String(value)
  }
}
