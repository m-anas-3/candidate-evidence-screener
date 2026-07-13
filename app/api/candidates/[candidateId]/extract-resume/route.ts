import { z } from "zod"

import { MAX_RESUME_BYTES } from "@/lib/intake/validation"
import {
  extractResumeText,
  ResumeExtractionError,
} from "@/lib/resume/extract-text"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const candidateIdSchema = z.uuid()
const STALE_EXTRACTION_MS = 2 * 60 * 1000

type ErrorResponse = {
  error: string
  ok: false
}

type SuccessResponse = {
  characterCount: number
  ok: true
  status: "ready"
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
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return errorResponse("Sign in to extract this resume.", 401)
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id, job_id, resume_path, resume_text, analysis_status, updated_at")
    .eq("id", candidateId)
    .maybeSingle()

  if (candidateError) {
    console.error("Candidate lookup for extraction failed", {
      code: candidateError.code,
    })
    return errorResponse("The candidate could not be loaded.", 500)
  }

  if (!candidate) {
    return errorResponse("Candidate not found.", 404)
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", candidate.job_id)
    .eq("recruiter_id", recruiterId)
    .maybeSingle()

  if (jobError) {
    console.error("Job ownership check for extraction failed", {
      code: jobError.code,
    })
    return errorResponse("The candidate could not be loaded.", 500)
  }

  if (!job) {
    return errorResponse("Candidate not found.", 404)
  }

  const expectedResumePath = `${recruiterId}/${candidateId}/resume.pdf`

  if (candidate.resume_path !== expectedResumePath) {
    return errorResponse("The candidate resume path is invalid.", 409)
  }

  if (candidate.resume_text && candidate.analysis_status === "ready") {
    return successResponse(candidate.resume_text.length)
  }

  if (
    candidate.analysis_status === "processing" ||
    candidate.analysis_status === "completed"
  ) {
    return errorResponse("This candidate is already being analyzed.", 409)
  }

  const extractionIsStale =
    candidate.analysis_status === "extracting" &&
    Date.now() - new Date(candidate.updated_at).getTime() > STALE_EXTRACTION_MS

  if (candidate.analysis_status === "extracting" && !extractionIsStale) {
    return errorResponse("Resume extraction is already in progress.", 409)
  }

  const { data: claimedCandidate, error: claimError } = await supabase
    .from("candidates")
    .update({
      analysis_error: null,
      analysis_status: "extracting",
      resume_text: null,
    })
    .eq("id", candidateId)
    .eq("analysis_status", candidate.analysis_status)
    .eq("updated_at", candidate.updated_at)
    .select("id")
    .maybeSingle()

  if (claimError) {
    console.error("Resume extraction claim failed", { code: claimError.code })
    return errorResponse("Resume extraction could not be started.", 500)
  }

  if (!claimedCandidate) {
    return errorResponse("Resume extraction is already in progress.", 409)
  }

  try {
    const { data: resume, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(candidate.resume_path)

    if (downloadError || !resume) {
      throw new ResumeExtractionError(
        "The private resume could not be downloaded.",
        "invalid_pdf"
      )
    }

    if (resume.size === 0 || resume.size > MAX_RESUME_BYTES) {
      throw new ResumeExtractionError(
        "The resume must be a non-empty PDF no larger than 2 MB.",
        "invalid_pdf"
      )
    }

    if (resume.type && resume.type !== "application/pdf") {
      throw new ResumeExtractionError(
        "The uploaded file is not a PDF.",
        "invalid_pdf"
      )
    }

    const text = await extractResumeText(
      new Uint8Array(await resume.arrayBuffer())
    )
    const { data: updatedCandidate, error: updateError } = await supabase
      .from("candidates")
      .update({
        analysis_error: null,
        analysis_status: "ready",
        resume_text: text,
      })
      .eq("id", candidateId)
      .eq("analysis_status", "extracting")
      .select("id")
      .maybeSingle()

    if (updateError || !updatedCandidate) {
      throw new Error("Extracted resume text could not be persisted.")
    }

    return successResponse(text.length)
  } catch (error) {
    const message =
      error instanceof ResumeExtractionError
        ? error.userMessage
        : "Resume text could not be extracted. Try again or upload another PDF."

    if (!(error instanceof ResumeExtractionError)) {
      console.error("Unexpected resume extraction failure", {
        name: error instanceof Error ? error.name : "UnknownError",
      })
    }

    const { error: failureUpdateError } = await supabase
      .from("candidates")
      .update({
        analysis_error: message,
        analysis_status: "failed",
        resume_text: null,
      })
      .eq("id", candidateId)
      .eq("analysis_status", "extracting")

    if (failureUpdateError) {
      console.error("Resume extraction failure state could not be saved", {
        code: failureUpdateError.code,
      })
    }

    return errorResponse(message, 422)
  }
}

function errorResponse(error: string, status: number) {
  return Response.json({ error, ok: false } satisfies ErrorResponse, {
    headers: { "Cache-Control": "no-store" },
    status,
  })
}

function successResponse(characterCount: number) {
  return Response.json(
    { characterCount, ok: true, status: "ready" } satisfies SuccessResponse,
    { headers: { "Cache-Control": "no-store" } }
  )
}
