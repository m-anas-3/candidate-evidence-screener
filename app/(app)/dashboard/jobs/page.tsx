import type { Metadata } from "next"
import { IconBriefcase } from "@tabler/icons-react"

export const metadata: Metadata = { title: "Jobs" }

export default function JobsPage() {
  return (
    <section aria-labelledby="jobs-heading" className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight" id="jobs-heading">
          Jobs
        </h1>
        <p className="text-sm text-muted-foreground">
          Job criteria will anchor every candidate screening report.
        </p>
      </div>

      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <IconBriefcase aria-hidden="true" className="size-6" />
        </span>
        <h2 className="font-semibold">No jobs yet</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Job creation is the next implementation module. Authentication and
          private workspace access are ready first.
        </p>
      </div>
    </section>
  )
}
