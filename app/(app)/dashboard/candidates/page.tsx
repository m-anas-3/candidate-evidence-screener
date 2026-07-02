import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowRight, IconUserScan } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidates" }

export default async function CandidatesPage() {
  const supabase = await createClient()
  const [{ data: candidates, error }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase
        .from("candidates")
        .select("id, job_id, name, analysis_status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title"),
    ])

  if (error || jobsError) {
    throw new Error("Candidates could not be loaded.")
  }

  const jobTitles = new Map(jobs.map((job) => [job.id, job.title]))

  return (
    <section aria-labelledby="candidates-heading" className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Workspace</p>
          <h1
            className="text-2xl font-semibold tracking-tight"
            id="candidates-heading"
          >
            Candidates
          </h1>
          <p className="text-sm text-muted-foreground">
            Candidate evidence stays isolated to your signed-in account.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/jobs">Add from a job</Link>
        </Button>
      </div>

      {candidates.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              <Link
                className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                href={`/dashboard/candidates/${candidate.id}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {candidate.name}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {jobTitles.get(candidate.job_id) ?? "Unavailable job"}
                  </span>
                  <span className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                    {candidate.analysis_status}
                  </span>
                </span>
                <IconArrowRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <IconUserScan
            aria-hidden="true"
            className="mb-4 size-7 text-muted-foreground"
          />
          <h2 className="font-semibold">No candidates yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Open a job to add a candidate proposal, portfolio, and private PDF
            resume.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/jobs">View jobs</Link>
          </Button>
        </div>
      )}
    </section>
  )
}
