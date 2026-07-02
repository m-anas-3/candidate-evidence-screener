import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard/jobs")
  }

  return (
    <main className="grid min-h-svh bg-muted/40 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]">
      <section className="hidden border-r border-border bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <p className="text-sm font-medium tracking-wide">
          Freelance Candidate Evidence Screener
        </p>
        <div className="max-w-xl space-y-5">
          <p className="text-sm font-medium text-background/60">
            Evidence before assumptions
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
            Review freelance candidates against the work that matters.
          </h1>
          <p className="max-w-lg text-base leading-7 text-background/70">
            Compare job requirements with resume, proposal, and portfolio
            evidence. Every result remains advisory and reviewable by a human.
          </p>
        </div>
        <p className="text-xs text-background/50">
          Private resumes · Evidence-backed reports · Human review required
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
