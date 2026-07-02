"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { jobInputSchema } from "@/lib/intake/validation"
import type { IntakeActionState } from "@/lib/intake/types"
import { createClient } from "@/lib/supabase/server"

export async function createJob(
  _previousState: IntakeActionState,
  formData: FormData
): Promise<IntakeActionState> {
  const parsed = jobInputSchema.safeParse({
    description: formData.get("description"),
    mustHaveSkills: formData.get("mustHaveSkills"),
    requirements: formData.get("requirements"),
    title: formData.get("title"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: "Check the highlighted fields.",
      status: "error",
    }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return {
      message: "Your session expired. Sign in and try again.",
      status: "error",
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
      message: "The job could not be created. Try again.",
      status: "error",
    }
  }

  revalidatePath("/dashboard/jobs")
  redirect(`/dashboard/jobs/${data.id}`)
}
