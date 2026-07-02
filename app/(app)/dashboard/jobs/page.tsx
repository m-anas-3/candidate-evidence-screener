import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowRight, IconBriefcase } from "@tabler/icons-react"

import { JobForm } from "@/components/job-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Jobs" }

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, must_have_skills, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Jobs could not be loaded.")
  }

  return (
    <section aria-labelledby="jobs-heading" className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight" id="jobs-heading">
          Jobs
        </h1>
        <p className="text-sm text-muted-foreground">
          Define the criteria that will anchor each candidate screening.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your jobs</h2>
          {jobs.length ? (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                    href={`/dashboard/jobs/${job.id}`}
                  >
                    <span className="min-w-0 space-y-2">
                      <span className="block truncate font-semibold">
                        {job.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {job.must_have_skills.length
                          ? `${job.must_have_skills.slice(0, 3).join(" · ")}${job.must_have_skills.length > 3 ? " · …" : ""}`
                          : "No must-have skills specified"}
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
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
              <IconBriefcase
                aria-hidden="true"
                className="mb-4 size-7 text-muted-foreground"
              />
              <h2 className="font-semibold">No jobs yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create a job to establish the evidence candidates will be
                screened against.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold">Create a job</h2>
            <p className="text-sm text-muted-foreground">
              Keep the criteria concrete so later analysis can cite evidence.
            </p>
          </div>
          <JobForm />
        </div>
      </div>
    </section>
  )
}
