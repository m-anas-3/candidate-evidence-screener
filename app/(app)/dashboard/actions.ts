"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { randomUUID } from "node:crypto"

import { createClient } from "@/lib/supabase/server"
import { syntheticSample } from "@/lib/sample-data"

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login?notice=signed-out")
}

export type SyntheticSampleActionState = {
  message?: string
  status?: "error"
}

export async function createSyntheticSample(
  _previousState: SyntheticSampleActionState
): Promise<SyntheticSampleActionState> {
  void _previousState
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return {
      message: "Your session expired. Sign in and try again.",
      status: "error",
    }
  }

  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get("x-forwarded-host")
  const host = forwardedHost ?? requestHeaders.get("host")
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")
  const protocol = forwardedProtocol === "http" ? "http" : "https"

  if (!host) {
    return {
      message: "The sample portfolio URL could not be created.",
      status: "error",
    }
  }

  const portfolioUrl = new URL(
    "/sample-portfolio",
    `${protocol}://${host}`
  ).toString()
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      description: syntheticSample.job.description,
      must_have_skills: [...syntheticSample.job.mustHaveSkills],
      recruiter_id: recruiterId,
      requirements: syntheticSample.job.requirements,
      title: syntheticSample.job.title,
    })
    .select("id")
    .single()

  if (jobError || !job) {
    console.error("Synthetic sample job creation failed", {
      code: jobError?.code,
    })
    return {
      message: "The sample could not be created. Try again.",
      status: "error",
    }
  }

  const candidateId = randomUUID()
  const { error: candidateError } = await supabase.from("candidates").insert({
    analysis_error: null,
    analysis_status: "ready",
    id: candidateId,
    job_id: job.id,
    name: syntheticSample.candidate.name,
    portfolio_url: portfolioUrl,
    proposal_text: syntheticSample.candidate.proposalText,
    resume_path: `${recruiterId}/${candidateId}/synthetic-sample.pdf`,
    resume_text: syntheticSample.candidate.resumeText,
  })

  if (candidateError) {
    console.error("Synthetic sample candidate creation failed", {
      code: candidateError.code,
    })
    await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id)
      .eq("recruiter_id", recruiterId)
    return {
      message: "The sample could not be created. Try again.",
      status: "error",
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  revalidatePath("/dashboard/candidates")
  redirect(`/dashboard/jobs/${job.id}/candidates/${candidateId}`)
}
