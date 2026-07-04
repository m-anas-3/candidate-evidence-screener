import type { Metadata } from "next"
import { CandidatesTable } from "@/components/candidates-table"
import { PageHeader } from "@/components/page-header"
import { RouteToast } from "@/components/route-toast"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidates" }

interface RawCandidate {
  id: string
  job_id: string
  name: string
  analysis_status: string
  created_at: string
  jobs: { title: string } | { title: string }[] | null
  screening_reports:
    | { recommendation: string | null; score: number | null }
    | { recommendation: string | null; score: number | null }[]
    | null
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams
  const supabase = await createClient()

  const [{ data: candidates, error }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase
        .from("candidates")
        .select(
          `
          id,
          job_id,
          name,
          analysis_status,
          created_at,
          jobs (
            title
          ),
          screening_reports (
            score,
            recommendation
          )
        `
        )
        .order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title"),
    ])

  if (error || jobsError) {
    throw new Error("Candidates could not be loaded.")
  }

  // Format and safely cast joined relation arrays or objects
  const formattedCandidates = (
    (candidates as unknown as RawCandidate[]) ?? []
  ).map((candidate) => {
    const reportVal = candidate.screening_reports
    const reportObj = Array.isArray(reportVal) ? reportVal[0] : reportVal

    const jobVal = candidate.jobs
    const jobObj = Array.isArray(jobVal) ? jobVal[0] : jobVal

    return {
      id: candidate.id,
      job_id: candidate.job_id,
      name: candidate.name,
      analysis_status: candidate.analysis_status,
      created_at: candidate.created_at,
      jobs: jobObj ? { title: String(jobObj.title) } : null,
      screening_reports: reportObj
        ? {
            score: typeof reportObj.score === "number" ? reportObj.score : null,
            recommendation:
              typeof reportObj.recommendation === "string"
                ? reportObj.recommendation
                : null,
          }
        : null,
    }
  })

  return (
    <section
      aria-labelledby="candidates-heading"
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      {notice === "candidate-deleted" && (
        <RouteToast id="candidate-deleted" message="Candidate deleted." />
      )}
      {notice === "candidate-unavailable" && (
        <RouteToast
          id="candidate-unavailable"
          message="That candidate is no longer available."
          variant="error"
        />
      )}
      <PageHeader
        eyebrow="Recruiting Workspace"
        title="Candidates"
        description="Search and filter candidates across all active job postings."
      />

      <CandidatesTable candidates={formattedCandidates} jobs={jobs ?? []} />
    </section>
  )
}
