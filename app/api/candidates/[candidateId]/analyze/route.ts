import { randomUUID } from "node:crypto"

import { z } from "zod"

import {
  createCandidateAnalysisAgent,
  getCandidateAnalysisPrompt,
  getCandidateAnalysisAgentConfiguration,
} from "@/lib/agent/harness"
import { RECRUITER_PROMPT_VERSION } from "@/lib/agent/prompt"
import {
  consumeAiRateLimit,
  formatRetryAfter,
  getAnalysisContextLimitError,
} from "@/lib/security/ai-guardrails"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 300

const candidateIdSchema = z.uuid()
const STALE_ANALYSIS_MS = 5 * 60 * 1000 + 30_000
const SAFE_ANALYSIS_ERROR =
  "Candidate analysis could not be completed. Review the evidence and try again."

type ErrorResponse = {
  error: string
  ok: false
  reference?: string
}

type SuccessResponse = {
  candidateId: string
  ok: true
  status: "completed"
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const candidateIdResult = candidateIdSchema.safeParse(
    (await params).candidateId
  )

  if (!candidateIdResult.success) {
    return errorResponse("Candidate ID is invalid.", 400)
  }

  const candidateId = candidateIdResult.data
  const requestReference = randomUUID()
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return errorResponse("Sign in to analyze this candidate.", 401)
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select(
      `
      id,
      job_id,
      proposal_text,
      resume_text,
      analysis_status,
      updated_at,
      jobs!inner (
        recruiter_id,
        title,
        description,
        requirements,
        must_have_skills
      )
    `
    )
    .eq("id", candidateId)
    .eq("jobs.recruiter_id", recruiterId)
    .maybeSingle()

  if (candidateError) {
    logAnalysisFailure(requestReference, "candidate_lookup")
    return errorResponse(
      "The candidate could not be loaded.",
      500,
      requestReference
    )
  }

  if (!candidate) {
    return errorResponse("Candidate not found.", 404)
  }

  if (!candidate.resume_text) {
    return errorResponse("Extract the candidate resume before analysis.", 409)
  }

  const jobValue = candidate.jobs
  const job = Array.isArray(jobValue) ? jobValue[0] : jobValue
  if (!job) {
    return errorResponse("Candidate job context could not be loaded.", 500)
  }

  if (candidate.analysis_status === "completed") {
    return successResponse(candidateId)
  }

  if (candidate.analysis_status === "extracting") {
    return errorResponse("Resume extraction is still in progress.", 409)
  }

  if (candidate.analysis_status === "pending") {
    return errorResponse("Extract the candidate resume before analysis.", 409)
  }

  if (candidate.analysis_status === "processing") {
    const { data: existingReport, error: reportLookupError } = await supabase
      .from("screening_reports")
      .select("status")
      .eq("candidate_id", candidateId)
      .maybeSingle()

    if (reportLookupError) {
      logAnalysisFailure(requestReference, "processing_report_lookup")
      return errorResponse(
        "Candidate analysis status could not be checked.",
        500,
        requestReference
      )
    }

    if (existingReport?.status === "completed") {
      const finalized = await finalizeCandidate(
        supabase,
        candidateId,
        requestReference
      )
      return finalized
        ? successResponse(candidateId)
        : errorResponse(
            "Candidate analysis status could not be finalized.",
            500,
            requestReference
          )
    }

    const processingIsStale =
      Date.now() - new Date(candidate.updated_at).getTime() > STALE_ANALYSIS_MS

    if (!processingIsStale) {
      return errorResponse("Candidate analysis is already in progress.", 409)
    }
  }

  const contextLimitError = getAnalysisContextLimitError({
    description: job.description,
    mustHaveSkills: job.must_have_skills,
    proposalText: candidate.proposal_text,
    requirements: job.requirements,
    resumeText: candidate.resume_text,
    title: job.title,
  })
  if (contextLimitError) {
    return errorResponse(contextLimitError, 413)
  }

  let agentConfiguration
  try {
    agentConfiguration = getCandidateAnalysisAgentConfiguration()
  } catch {
    logAnalysisFailure(requestReference, "agent_configuration")
    return errorResponse(
      "Candidate analysis is not configured.",
      503,
      requestReference
    )
  }

  const rateLimit = await consumeAiRateLimit(supabase, "candidate_analysis")
  if (!rateLimit.allowed) {
    if ("unavailable" in rateLimit) {
      return errorResponse(
        "Candidate analysis is temporarily unavailable. Try again shortly.",
        503,
        requestReference
      )
    }

    return errorResponse(
      `Too many analysis requests. Try again in ${formatRetryAfter(rateLimit.retryAfterSeconds)}.`,
      429,
      undefined,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    )
  }

  const { data: claimedCandidate, error: claimError } = await supabase
    .from("candidates")
    .update({ analysis_error: null, analysis_status: "processing" })
    .eq("id", candidateId)
    .eq("analysis_status", candidate.analysis_status)
    .eq("updated_at", candidate.updated_at)
    .select("id")
    .maybeSingle()

  if (claimError) {
    logAnalysisFailure(requestReference, "candidate_claim")
    return errorResponse(
      "Candidate analysis could not be started.",
      500,
      requestReference
    )
  }

  if (!claimedCandidate) {
    return errorResponse("Candidate analysis is already in progress.", 409)
  }

  const { error: reportStartError } = await supabase
    .from("screening_reports")
    .upsert(
      {
        candidate_id: candidateId,
        completed_at: null,
        error_message: null,
        matched_skills: null,
        missing_skills: null,
        model_identifier: agentConfiguration.modelIdentifier,
        outreach_message: null,
        portfolio_evidence: null,
        prompt_version: RECRUITER_PROMPT_VERSION,
        proposal_specificity_findings: null,
        raw_structured_output: null,
        recommendation: null,
        review_points: null,
        score: null,
        started_at: new Date().toISOString(),
        status: "processing",
        strengths: null,
        summary: null,
        weaknesses: null,
      },
      { onConflict: "candidate_id" }
    )

  if (reportStartError) {
    logAnalysisFailure(requestReference, "report_start")
    const recovered = await saveFailureState(
      supabase,
      candidateId,
      SAFE_ANALYSIS_ERROR,
      requestReference
    )
    return recovered
      ? errorResponse(
          "Candidate analysis could not be started.",
          500,
          requestReference
        )
      : errorResponse(
          "Candidate analysis could not recover. Try again shortly.",
          500,
          requestReference
        )
  }

  try {
    const agent = createCandidateAnalysisAgent(
      { candidateId, recruiterId, supabase },
      agentConfiguration
    )
    await agent.invoke(
      {
        messages: [
          { role: "user", content: getCandidateAnalysisPrompt(candidateId) },
        ],
      },
      { signal: AbortSignal.timeout(270_000) }
    )

    const { data: savedReport, error: savedReportError } = await supabase
      .from("screening_reports")
      .select("status")
      .eq("candidate_id", candidateId)
      .maybeSingle()

    if (savedReportError || savedReport?.status !== "completed") {
      throw new Error("The agent did not save a completed report.")
    }

    if (!(await finalizeCandidate(supabase, candidateId, requestReference))) {
      throw new Error("The completed candidate state could not be saved.")
    }

    return successResponse(candidateId)
  } catch (error) {
    // Detailed server-side log so the real error is visible in the terminal.
    console.error("[recruiter-agent] Agent run failed", {
      reference: requestReference,
      candidateId,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      // Include cause chain, validation error code, and Zod issues when available
      cause:
        error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : undefined,
      validationCode:
        error != null && typeof error === "object" && "code" in error
          ? (error as { code: unknown }).code
          : undefined,
      zodIssues:
        error != null &&
        typeof error === "object" &&
        "issues" in error &&
        Array.isArray((error as { issues: unknown }).issues)
          ? (error as { issues: unknown[] }).issues
          : undefined,
      stack:
        error instanceof Error
          ? error.stack?.split("\n").slice(0, 6).join("\n")
          : undefined,
    })
    logAnalysisFailure(
      requestReference,
      "agent_run",
      error instanceof Error ? error.name : "UnknownError"
    )

    const { data: report, error: reportLookupError } = await supabase
      .from("screening_reports")
      .select("status")
      .eq("candidate_id", candidateId)
      .maybeSingle()

    if (reportLookupError) {
      logAnalysisFailure(requestReference, "failure_report_lookup")
      const recovered = await saveFailureState(
        supabase,
        candidateId,
        SAFE_ANALYSIS_ERROR,
        requestReference
      )
      return recovered
        ? errorResponse(SAFE_ANALYSIS_ERROR, 422, requestReference)
        : errorResponse(
            "Candidate analysis could not recover. Try again shortly.",
            500,
            requestReference
          )
    }

    if (report?.status === "completed") {
      if (await finalizeCandidate(supabase, candidateId, requestReference)) {
        return successResponse(candidateId)
      }
    } else {
      const recovered = await saveFailureState(
        supabase,
        candidateId,
        SAFE_ANALYSIS_ERROR,
        requestReference
      )
      if (!recovered) {
        return errorResponse(
          "Candidate analysis could not recover. Try again shortly.",
          500,
          requestReference
        )
      }
    }

    return errorResponse(SAFE_ANALYSIS_ERROR, 422, requestReference)
  }
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

async function finalizeCandidate(
  supabase: ServerSupabaseClient,
  candidateId: string,
  requestReference: string
) {
  const { data, error } = await supabase
    .from("candidates")
    .update({ analysis_error: null, analysis_status: "completed" })
    .eq("id", candidateId)
    .eq("analysis_status", "processing")
    .select("id")
    .maybeSingle()

  if (error) {
    logAnalysisFailure(
      requestReference,
      "agent_run",
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "UnknownError"
    )

    return false
  }

  if (data) return true

  const { data: currentCandidate, error: lookupError } = await supabase
    .from("candidates")
    .select("analysis_status")
    .eq("id", candidateId)
    .maybeSingle()

  if (lookupError) {
    logAnalysisFailure(requestReference, "candidate_completion_verification")
  }

  return currentCandidate?.analysis_status === "completed"
}

async function saveFailureState(
  supabase: ServerSupabaseClient,
  candidateId: string,
  message: string,
  requestReference: string
) {
  const { error: reportError } = await supabase
    .from("screening_reports")
    .update({ error_message: message, status: "failed" })
    .eq("candidate_id", candidateId)
    .eq("status", "processing")

  const { error: candidateError } = await supabase
    .from("candidates")
    .update({ analysis_error: message, analysis_status: "failed" })
    .eq("id", candidateId)
    .eq("analysis_status", "processing")

  if (reportError || candidateError) {
    logAnalysisFailure(requestReference, "failure_state_persistence")
    return false
  }

  return true
}

function logAnalysisFailure(
  reference: string,
  operation: string,
  errorName = "none"
) {
  console.error("Candidate analysis operation failed", {
    errorName,
    operation,
    reference,
  })
}

function errorResponse(
  error: string,
  status: number,
  reference?: string,
  headers?: HeadersInit
) {
  return Response.json(
    { error, ok: false, reference } satisfies ErrorResponse,
    {
      headers: { "Cache-Control": "no-store", ...headers },
      status,
    }
  )
}

function successResponse(candidateId: string) {
  return Response.json(
    { candidateId, ok: true, status: "completed" } satisfies SuccessResponse,
    { headers: { "Cache-Control": "no-store" } }
  )
}
