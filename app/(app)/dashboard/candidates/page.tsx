import type { Metadata } from "next"
import { IconUserScan } from "@tabler/icons-react"

export const metadata: Metadata = { title: "Candidates" }

export default function CandidatesPage() {
  return (
    <section aria-labelledby="candidates-heading" className="space-y-6">
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

      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <IconUserScan aria-hidden="true" className="size-6" />
        </span>
        <h2 className="font-semibold">No candidates yet</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Candidate intake becomes available after you create the first job.
        </p>
      </div>
    </section>
  )
}
