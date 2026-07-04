"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { jobInputSchema } from "@/lib/intake/validation"
import type { IntakeActionState } from "@/lib/intake/types"
import { createClient } from "@/lib/supabase/server"

type JobInsertResult = { jobId: string } | { state: IntakeActionState }

async function insertOwnedJob(formData: FormData): Promise<JobInsertResult> {
  const parsed = jobInputSchema.safeParse({
    description: formData.get("description"),
    mustHaveSkills: formData.get("mustHaveSkills"),
    requirements: formData.get("requirements"),
    title: formData.get("title"),
  })

  if (!parsed.success) {
    return {
      state: {
        eventId: crypto.randomUUID(),
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Check the highlighted fields.",
        status: "error",
      },
    }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return {
      state: {
        eventId: crypto.randomUUID(),
        message: "Your session expired. Sign in and try again.",
        status: "error",
      },
    }
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      description: parsed.data.description,
      must_have_skills: parsed.data.mustHaveSkills,
      recruiter_id: recruiterId,
      requirements: parsed.data.requirements,
      title: parsed.data.title,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Job creation failed", { code: error.code })
    return {
      state: {
        eventId: crypto.randomUUID(),
        message: "The job could not be created. Try again.",
        status: "error",
      },
    }
  }

  return { jobId: data.id }
}

export async function createJob(
  _previousState: IntakeActionState,
  formData: FormData
): Promise<IntakeActionState> {
  const result = await insertOwnedJob(formData)
  if ("state" in result) return result.state

  revalidatePath("/dashboard/jobs")
  redirect(`/dashboard/jobs/${result.jobId}?notice=job-created`)
}

/**
 * Dialog-safe variant: returns a success state with jobId instead of
 * calling redirect(), so it can be used inside a Dialog/Sheet without
 * triggering a navigation-during-render error.
 */
export async function createJobForDialog(
  _previousState: IntakeActionState,
  formData: FormData
): Promise<IntakeActionState> {
  const result = await insertOwnedJob(formData)
  if ("state" in result) return result.state

  revalidatePath("/dashboard/jobs")
  return {
    eventId: crypto.randomUUID(),
    status: "success",
    jobId: result.jobId,
  }
}

export async function deleteJob(
  jobId: string,
  redirectTo?: string
): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return {
      ok: false,
      message: "Your session expired. Sign in and try again.",
    }
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, candidates(resume_path)")
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .maybeSingle()

  if (jobError || !job) {
    return {
      ok: false,
      message: "The role is unavailable or was already deleted.",
    }
  }

  const { data: deletedJob, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .select("id")
    .maybeSingle()

  if (deleteError || !deletedJob) {
    console.error("Job deletion failed", { code: deleteError?.code })
    return { ok: false, message: "The role could not be deleted. Try again." }
  }

  const resumePaths = job.candidates.map((candidate) => candidate.resume_path)
  if (resumePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove(resumePaths)

    if (storageError) {
      console.error("Role resume cleanup failed", { code: storageError.name })
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/jobs")
  revalidatePath("/dashboard/candidates")
  if (redirectTo === "/dashboard/jobs") {
    redirect("/dashboard/jobs?notice=role-deleted")
  }
  return { ok: true }
}
