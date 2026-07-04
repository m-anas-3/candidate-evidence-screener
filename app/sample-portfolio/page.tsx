import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Synthetic candidate portfolio fixture",
  robots: { follow: false, index: false },
}

export default function SamplePortfolioPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          Synthetic evaluation fixture
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Jordan Lee — Selected work
        </h1>
        <p className="mt-3 text-muted-foreground">
          This fictional portfolio contains no real person or client data.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Commerce checkout rebuild</h2>
        <p>
          Rebuilt a high-volume checkout with Next.js and TypeScript.
          Server-side pricing validation and PostgreSQL query improvements
          reduced median response time by 38% across a measured production
          baseline.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Order reliability dashboard</h2>
        <p>
          Created a typed Next.js operations dashboard backed by PostgreSQL,
          including role-scoped server queries, failure-state monitoring, and
          documented verification steps for incident response.
        </p>
      </section>
    </main>
  )
}
