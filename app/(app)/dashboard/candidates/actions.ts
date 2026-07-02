"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { CandidateActionResult } from "@/lib/intake/types"
import {
  candidateInputSchema,
  type CandidateInput,
} from "@/lib/intake/validation"
import { createClient } from "@/lib/supabase/server"

export async function createCandidate(
  input: CandidateInput
): Promise<CandidateActionResult> {
  const parsed = candidateInputSchema.safeParse(input)

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: "Check the candidate details and try again.",
      ok: false,
    }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return {
      message: "Your session expired. Sign in and try again.",
      ok: false,
    }
  }

  const expectedPath = `${recruiterId}/${parsed.data.candidateId}/resume.pdf`

  if (parsed.data.resumePath !== expectedPath) {
    return { message: "The resume path is invalid.", ok: false }
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", parsed.data.jobId)
    .eq("recruiter_id", recruiterId)
    .maybeSingle()

  if (jobError || !job) {
    return { message: "The selected job is unavailable.", ok: false }
  }

  const resumeFolder = `${recruiterId}/${parsed.data.candidateId}`
  const { data: objects, error: storageError } = await supabase.storage
    .from("resumes")
    .list(resumeFolder, { limit: 1, search: "resume.pdf" })

  if (
    storageError ||
    !objects?.some((object) => object.name === "resume.pdf")
  ) {
    return {
      message: "The private resume upload could not be verified.",
      ok: false,
    }
  }

  const { error } = await supabase.from("candidates").insert({
    id: parsed.data.candidateId,
    job_id: parsed.data.jobId,
    name: parsed.data.name,
    portfolio_url: parsed.data.portfolioUrl,
    proposal_text: parsed.data.proposalText,
    resume_path: parsed.data.resumePath,
  })

  if (error) {
    console.error("Candidate creation failed", { code: error.code })
    return {
      message: "The candidate could not be created. Try again.",
      ok: false,
    }
  }

  revalidatePath("/dashboard/candidates")
  revalidatePath(`/dashboard/jobs/${parsed.data.jobId}`)

  return { ok: true }
}
