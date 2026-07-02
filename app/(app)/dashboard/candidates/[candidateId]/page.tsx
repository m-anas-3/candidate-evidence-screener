import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  IconArrowLeft,
  IconExternalLink,
  IconFileCheck,
} from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate details" }

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ candidateId: string }>
}) {
  const { candidateId } = await params
  const supabase = await createClient()
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select(
      "id, job_id, name, proposal_text, portfolio_url, analysis_status, analysis_error, created_at"
    )
    .eq("id", candidateId)
    .maybeSingle()

  if (error) {
    throw new Error("The candidate could not be loaded.")
  }

  if (!candidate) {
    notFound()
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", candidate.job_id)
    .maybeSingle()

  if (jobError) {
    throw new Error("The candidate's job could not be loaded.")
  }

  if (!job) {
    notFound()
  }

  return (
    <section className="space-y-8">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/dashboard/candidates"
      >
        <IconArrowLeft aria-hidden="true" className="size-4" />
        All candidates
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Candidate evidence</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {candidate.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          For{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href={`/dashboard/jobs/${job.id}`}
          >
            {job.title}
          </Link>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold">Proposal</h2>
            <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
              {candidate.proposal_text}
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold">Portfolio</h2>
            <a
              className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-medium break-all text-primary underline underline-offset-4"
              href={candidate.portfolio_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {candidate.portfolio_url}
              <IconExternalLink
                aria-hidden="true"
                className="size-4 shrink-0"
              />
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Portfolio content has not been inspected yet.
            </p>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <IconFileCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Private resume</h2>
                <p className="text-xs text-muted-foreground">PDF uploaded</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Analysis status</h2>
            <p className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
              {candidate.analysis_status}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Resume extraction and evidence analysis are not implemented yet.
            </p>
            {candidate.analysis_error ? (
              <p className="mt-3 text-xs text-destructive">
                {candidate.analysis_error}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}
