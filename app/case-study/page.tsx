import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconCheck,
  IconFileDescription,
  IconFileSearch,
  IconLock,
  IconMessageCircle,
  IconReportAnalytics,
  IconShieldCheck,
  IconStack2,
  IconUpload,
} from "@tabler/icons-react"

import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Portfolio Case Study",
  description:
    "A public case study of an evidence-backed candidate screening workflow built with Next.js, Supabase, and validated AI output.",
}

const workflow = [
  {
    title: "Create the role",
    copy: "Capture the job description, requirements, and explicit must-have skills.",
    icon: IconFileDescription,
  },
  {
    title: "Add candidate evidence",
    copy: "Submit proposal text, a PDF resume, and an optional portfolio URL for manual review.",
    icon: IconUpload,
  },
  {
    title: "Extract the resume",
    copy: "Validate the private PDF and extract text on the server before analysis.",
    icon: IconFileSearch,
  },
  {
    title: "Generate the report",
    copy: "Map supported and missing evidence into a strict, validated report schema.",
    icon: IconReportAnalytics,
  },
  {
    title: "Ask grounded questions",
    copy: "Continue the review with answers constrained to saved evidence and the report.",
    icon: IconMessageCircle,
  },
] as const

const safeguards = [
  "No automatic hiring or rejection decisions",
  "No protected-characteristic inference",
  "No AI-authorship detection claims",
  "Portfolio content is never fetched or scored",
  "Private resume storage with owner-scoped access",
  "Human recruiter review is required",
] as const

const engineering = [
  {
    title: "Private data boundary",
    copy: "Supabase Auth, Row Level Security, private Storage, and repeated server ownership checks keep recruiter records separated.",
    icon: IconLock,
  },
  {
    title: "Validated AI boundary",
    copy: "Zod-validated structured output, explicit evidence gaps, bounded context, persistent rate limits, and recoverable analysis states.",
    icon: IconShieldCheck,
  },
  {
    title: "Production-oriented stack",
    copy: "Next.js 16 App Router, React 19, TypeScript, Supabase, LangChain, Deep Agents, Vitest, ESLint, and Prettier.",
    icon: IconStack2,
  },
] as const

export default async function CaseStudyPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims)
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start screening"

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
        primaryLabel={primaryLabel}
        linkPrefix="/"
      />

      <main id="main-content">
        <section className="border-b py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase"
              >
                Portfolio case study
              </Badge>
              <h1 className="editorial-display mt-6 max-w-xl text-5xl leading-[0.95] font-normal tracking-[-0.05em] text-balance sm:text-7xl">
                Verify freelancer claims without outsourcing judgment.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Recruiters need to reconcile role requirements, proposals, and
                resumes quickly. Evidence Screener turns those documents into a
                reviewable evidence brief while keeping the final decision with
                a human recruiter.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Badge>Evidence-backed</Badge>
                <Badge variant="secondary">Synthetic demo</Badge>
                <Badge variant="outline">Human review required</Badge>
              </div>
            </div>

            <SyntheticReport />
          </div>
        </section>

        <section className="border-b bg-surface-subtle py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
              Product workflow
            </p>
            <h2 className="editorial-display mt-3 max-w-2xl text-4xl leading-none font-normal tracking-[-0.04em] sm:text-5xl">
              A complete review path from role criteria to follow-up.
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-5">
              {workflow.map((step, index) => (
                <article key={step.title} className="bg-background p-5">
                  <div className="flex items-center justify-between">
                    <step.icon className="size-5 text-primary" aria-hidden />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                Responsible boundary
              </p>
              <h2 className="editorial-display mt-3 text-4xl leading-none font-normal tracking-[-0.04em] sm:text-5xl">
                Assistance, not automated selection.
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                The product reports documented fit and uncertainty. It does not
                decide who should be hired, profile personal traits, or turn a
                portfolio into an opaque score.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {safeguards.map((safeguard) => (
                <div
                  key={safeguard}
                  className="flex items-start gap-3 rounded-lg border p-4 text-sm"
                >
                  <IconCheck
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{safeguard}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b bg-surface-accent py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
              Engineering proof points
            </p>
            <h2 className="editorial-display mt-3 text-4xl leading-none font-normal tracking-[-0.04em] sm:text-5xl">
              Built around explicit trust boundaries.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {engineering.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border bg-background p-6"
                >
                  <item.icon className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-6 text-base font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
            <div>
              <p className="text-2xl font-semibold">
                Explore the synthetic workflow.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                The authenticated sample uses fictional data and requires no
                real candidate documents.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={primaryHref}>
                {isAuthenticated ? "Open dashboard" : "Create a demo workspace"}
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter isAuthenticated={isAuthenticated} linkPrefix="/" />
    </div>
  )
}

function SyntheticReport() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-xl shadow-foreground/5">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Synthetic evidence brief</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase">
            Fictional candidate and role
          </p>
        </div>
        <Badge variant="outline">Advisory</Badge>
      </div>
      <div className="grid grid-cols-2 border-b sm:grid-cols-4">
        <ReportMetric label="Score" value="79 / 100" />
        <ReportMetric label="Recommendation" value="Possible Fit" />
        <ReportMetric label="Matched" value="6 criteria" />
        <ReportMetric label="Missing" value="1 must-have" />
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold">Supported evidence</p>
          <div className="mt-3 space-y-2">
            <EvidenceRow
              source="Resume"
              finding="Production TypeScript services"
            />
            <EvidenceRow
              source="Proposal"
              finding="Role-specific delivery plan"
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold">Recruiter review points</p>
          <div className="mt-3 rounded-md border border-dashed border-foreground/35 bg-surface-subtle p-3 text-xs leading-5">
            Kubernetes experience was not found. Verify this declared must-have
            before proceeding.
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 border-t bg-muted/25 px-5 py-4 text-xs text-muted-foreground">
        <IconShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
        Synthetic state only. No real candidate or client data is shown.
      </div>
    </div>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-b p-4 last:border-r-0 sm:border-b-0">
      <p className="font-mono text-[9px] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  )
}

function EvidenceRow({ source, finding }: { source: string; finding: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="font-mono text-[9px] text-primary uppercase">{source}</p>
      <p className="mt-1 text-xs leading-5">{finding}</p>
    </div>
  )
}
