import type { Metadata } from "next"

import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-page"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Synthetic candidate portfolio fixture",
  robots: { follow: false, index: false },
}

export default async function SamplePortfolioPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims)
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"

  return (
    <div className="landing-page min-h-svh overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0 focus:outline-none"
      >
        Skip to content
      </a>
      <LandingHeader
        isAuthenticated={isAuthenticated}
        primaryHref={primaryHref}
        primaryLabel={isAuthenticated ? "Open dashboard" : "Start screening"}
        linkPrefix="/"
      />
      <main
        id="main-content"
        className="mx-auto max-w-3xl space-y-10 px-6 py-16 sm:py-24"
      >
        <header className="border-b pb-10">
          <p className="text-sm font-medium text-primary">
            Synthetic evaluation fixture
          </p>
          <h1 className="editorial-display mt-3 text-5xl leading-none font-normal tracking-[-0.04em] sm:text-6xl">
            Jordan Lee — Selected work
          </h1>
          <p className="mt-4 text-muted-foreground">
            This fictional portfolio contains no real person or client data.
          </p>
        </header>

        <section className="space-y-3 border-b pb-10">
          <h2 className="text-xl font-semibold">Commerce checkout rebuild</h2>
          <p className="leading-7 text-muted-foreground">
            Rebuilt a high-volume checkout with Next.js and TypeScript.
            Server-side pricing validation and PostgreSQL query improvements
            reduced median response time by 38% across a measured production
            baseline.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Order reliability dashboard</h2>
          <p className="leading-7 text-muted-foreground">
            Created a typed Next.js operations dashboard backed by PostgreSQL,
            including role-scoped server queries, failure-state monitoring, and
            documented verification steps for incident response.
          </p>
        </section>
      </main>
      <LandingFooter isAuthenticated={isAuthenticated} linkPrefix="/" />
    </div>
  )
}
