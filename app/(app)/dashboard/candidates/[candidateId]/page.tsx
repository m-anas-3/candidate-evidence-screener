import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function OldCandidateDetailsPage({
  params,
}: {
  params: Promise<{ candidateId: string }>
}) {
  const { candidateId } = await params
  const supabase = await createClient()
  const { data: candidate } = await supabase
    .from("candidates")
    .select("job_id")
    .eq("id", candidateId)
    .maybeSingle()

  if (!candidate) {
    redirect("/dashboard/candidates")
  }

  redirect(`/dashboard/jobs/${candidate.job_id}/candidates/${candidateId}`)
}
