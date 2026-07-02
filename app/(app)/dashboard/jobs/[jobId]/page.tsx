import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"

import { CandidateForm } from "@/components/candidate-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Job details" }

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()
  const [{ data: authData }, { data: job, error: jobError }] =
    await Promise.all([
      supabase.auth.getClaims(),
      supabase
        .from("jobs")
        .select(
          "id, title, description, requirements, must_have_skills, created_at"
        )
        .eq("id", jobId)
        .maybeSingle(),
    ])

  const userId = authData?.claims?.sub

  if (jobError) {
    throw new Error("The job could not be loaded.")
  }

  if (!job || !userId) {
    notFound()
  }

  const { data: candidates, error: candidateError } = await supabase
    .from("candidates")
    .select("id, name, analysis_status, created_at")
    .eq("job_id", job.id)
    .order("created_at", { ascending: false })

  if (candidateError) {
    throw new Error("Candidates could not be loaded.")
  }

  return (
    <section className="space-y-8">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/dashboard/jobs"
      >
        <IconArrowLeft aria-hidden="true" className="size-4" />
        All jobs
      </Link>

      <div className="space-y-5 rounded-3xl border border-border bg-card p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Job criteria</p>
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
        </div>
        <DetailSection title="Description" value={job.description} />
        <DetailSection title="Requirements" value={job.requirements} />
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Must-have skills</h2>
          {job.must_have_skills.length ? (
            <ul className="flex flex-wrap gap-2">
              {job.must_have_skills.map((skill) => (
                <li
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  key={skill}
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None specified.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Candidates</h2>
            <p className="text-sm text-muted-foreground">
              {candidates.length}{" "}
              {candidates.length === 1 ? "candidate" : "candidates"}
            </p>
          </div>
          {candidates.length ? (
            <ul className="space-y-3">
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <Link
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                    href={`/dashboard/candidates/${candidate.id}`}
                  >
                    <span>
                      <span className="block font-semibold">
                        {candidate.name}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground capitalize">
                        {candidate.analysis_status}
                      </span>
                    </span>
                    <IconArrowRight
                      aria-hidden="true"
                      className="size-5 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No candidates have been added to this job.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold">Add a candidate</h2>
            <p className="text-sm text-muted-foreground">
              Resume extraction and analysis begin in the next modules.
            </p>
          </div>
          <CandidateForm jobId={job.id} userId={userId} />
        </div>
      </div>
    </section>
  )
}

function DetailSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
        {value}
      </p>
    </div>
  )
}
