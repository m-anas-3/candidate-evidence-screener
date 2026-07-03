import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const candidateIdSchema = z.uuid()

/**
 * GET /api/candidates/[candidateId]/status
 *
 * Lightweight endpoint used by TanStack Query to poll candidate analysis
 * status without triggering a full Next.js page re-render. Returns only the
 * fields the client-side controls need.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getClaims()
  const recruiterId = authData?.claims?.sub

  if (authError || !recruiterId) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const candidateIdResult = candidateIdSchema.safeParse(
    (await params).candidateId
  )
  if (!candidateIdResult.success) {
    return Response.json({ error: "Invalid candidate ID." }, { status: 400 })
  }

  const candidateId = candidateIdResult.data

  const { data, error } = await supabase
    .from("candidates")
    .select(
      `
      id,
      analysis_status,
      analysis_error,
      jobs!inner ( recruiter_id )
    `
    )
    .eq("id", candidateId)
    .eq("jobs.recruiter_id", recruiterId)
    .maybeSingle()

  if (error) {
    return Response.json(
      { error: "Candidate could not be loaded." },
      { status: 500 }
    )
  }

  if (!data) {
    return Response.json({ error: "Candidate not found." }, { status: 404 })
  }

  return Response.json(
    {
      id: data.id,
      analysis_status: data.analysis_status,
      analysis_error: data.analysis_error,
    },
    {
      headers: {
        // Never cache status — it needs to be fresh on every poll
        "Cache-Control": "no-store",
      },
    }
  )
}
