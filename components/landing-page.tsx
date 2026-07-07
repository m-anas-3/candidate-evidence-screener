import type { ReactNode } from "react"
import Link from "next/link"
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconCircleX,
  IconDatabase,
  IconEdit,
  IconExternalLink,
  IconFileDescription,
  IconFileSearch,
  IconFingerprint,
  IconLock,
  IconMenu2,
  IconMessageCircle,
  IconNotes,
  IconQuote,
  IconRoute,
  IconSearch,
  IconServer,
  IconShieldCheck,
  IconSparkles,
  IconUserCheck,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safeguards", label: "Safeguards" },
  { href: "#faq", label: "FAQ" },
] as const

const capabilities = [
  {
    title: "Requirement-by-requirement evidence",
    description:
      "Each role criterion stays attached to a resume or proposal excerpt—or is marked not found.",
    icon: IconRoute,
    detail: (
      <div className="mt-5 space-y-2">
        <MiniResult label="TypeScript" state="Resume · supported" />
        <MiniResult label="Kubernetes" state="Not found" missing />
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    title: "Explicit must-have gaps",
    description:
      "A missing declared must-have remains visible and caps the score at 79.",
    icon: IconAlertTriangle,
    detail: (
      <div className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 font-mono text-[11px] text-amber-700 dark:text-amber-300">
        SCORE CEILING · 79 / 100
      </div>
    ),
  },
  {
    title: "Proposal-specificity signals",
    description:
      "Review observable tailoring and role-specific detail without making AI-authorship claims.",
    icon: IconSearch,
    detail: <Meter value={12} max={15} label="Specificity" />,
  },
  {
    title: "Structured strengths and weaknesses",
    description:
      "A concise brief separates supported advantages from material evidence gaps.",
    icon: IconNotes,
    detail: (
      <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">
        <span className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-emerald-700 dark:text-emerald-300">
          + 3 supported
        </span>
        <span className="rounded-md bg-destructive/10 px-2 py-1.5 text-destructive">
          − 1 gap
        </span>
      </div>
    ),
  },
  {
    title: "Recruiter review points",
    description:
      "Turn uncertainty into a short list of claims to verify before moving forward.",
    icon: IconUserCheck,
    detail: (
      <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 font-mono text-primary">
          01
        </span>
        Verify infrastructure ownership
      </div>
    ),
  },
  {
    title: "Editable outreach draft",
    description:
      "Refine an advisory outreach or rejection draft before choosing what to send.",
    icon: IconEdit,
    detail: (
      <div className="mt-5 rounded-lg border bg-background/60 p-2.5 font-mono text-[10px] leading-5 text-muted-foreground">
        Thanks for sharing your experience…
        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary align-middle motion-reduce:animate-none" />
      </div>
    ),
  },
  {
    title: "Grounded follow-up chat",
    description:
      "Ask questions against the saved report and submitted source material—not the open web.",
    icon: IconMessageCircle,
    detail: (
      <div className="mt-5 flex gap-1.5">
        {[0, 1, 2].map((item) => (
          <span key={item} className="size-1.5 rounded-full bg-primary/70" />
        ))}
        <span className="ml-1 font-mono text-[10px] text-muted-foreground">
          source-bound
        </span>
      </div>
    ),
  },
  {
    title: "Manual portfolio review",
    description:
      "The public URL is preserved for the recruiter. Portfolio content is never fetched or scored.",
    icon: IconExternalLink,
    detail: (
      <div className="mt-5 flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2 text-[11px]">
        <span className="truncate text-muted-foreground">
          portfolio.example
        </span>
        <Badge variant="outline" className="ml-2 text-[9px]">
          Manual
        </Badge>
      </div>
    ),
  },
] as const

const faqs = [
  {
    question: "Does the system make hiring decisions?",
    answer:
      "No. Scores, recommendations, summaries, and drafts are advisory. The recruiter reviews the evidence, decides what to verify, and controls whether to continue or communicate with the candidate.",
  },
  {
    question: "What evidence does it analyze?",
    answer:
      "It compares one candidate's proposal and the text extracted from one PDF resume against one recruiter's job description, requirements, and explicit must-have skills. Unsupported claims are marked not found.",
  },
  {
    question: "Does it inspect portfolio websites?",
    answer:
      "No. An optional public portfolio URL is retained for manual recruiter review. The product does not fetch, analyze, or score portfolio content.",
  },
  {
    question: "What happens when a must-have is missing?",
    answer:
      "An unsupported criterion scores zero. If an explicitly declared must-have has no supporting resume or proposal evidence, the total score is capped at 79 and cannot receive a Strong Fit recommendation.",
  },
  {
    question: "Are scanned resumes supported?",
    answer:
      "No. The product accepts one PDF up to 2 MB and extracts text server-side. Scanned or image-only PDFs are unsupported because OCR is not included.",
  },
  {
    question: "Can recruiters ask follow-up questions?",
    answer:
      "Yes. After a report is completed, recruiters can ask grounded follow-up questions about the saved report, job, proposal, and extracted resume text. Follow-up chat cannot overwrite the report.",
  },
  {
    question: "Is this a candidate pipeline or ATS?",
    answer:
      "No. Evidence Screener is a focused evidence-review workspace for evaluating one freelance candidate against one job. It does not provide a pipeline board or candidate-stage workflow.",
  },
  {
    question: "How is candidate data protected?",
    answer:
      "Product access requires authentication. Records and private resume objects are scoped to the owning recruiter through Row Level Security, private Storage, and repeated server-side ownership checks. PDF bytes are used for server-side extraction and are never sent to OpenAI; only extracted text is analyzed. AI routes also apply input limits and persistent per-recruiter rate limits.",
  },
] as const

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start screening"

  return (
    <div className="landing-page min-h-svh overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <LandingHeader
        isAuthenticated={isAuthenticated}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
      />

      <main id="main-content">
        <Hero
          isAuthenticated={isAuthenticated}
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
        />
        <ProblemSection />
        <HowItWorks />
        <EvidenceTrace />
        <Capabilities />
        <Safeguards />
        <Security />
        <Faq />
        <FinalCta isAuthenticated={isAuthenticated} primaryHref={primaryHref} />
      </main>

      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  )
}

function LandingHeader({
  isAuthenticated,
  primaryHref,
  primaryLabel,
}: {
  isAuthenticated: boolean
  primaryHref: string
  primaryLabel: string
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/76">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {!isAuthenticated && (
            <Button asChild variant="ghost" className="text-[13px]">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild className="h-9 px-4 text-[13px] shadow-sm">
            <Link href={primaryHref}>
              {primaryLabel}
              <IconArrowRight data-icon="inline-end" className="size-3.5" />
            </Link>
          </Button>
        </div>

        <details className="landing-menu relative sm:hidden">
          <summary className="flex size-9 list-none items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <span className="sr-only">Open navigation</span>
            <IconMenu2 className="size-4" />
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute top-12 right-0 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t pt-2">
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Sign in
                </Link>
              )}
              <Link
                href={primaryHref}
                className="mt-1 flex items-center justify-between rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {primaryLabel}
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  )
}

function Hero({
  isAuthenticated,
  primaryHref,
  primaryLabel,
}: {
  isAuthenticated: boolean
  primaryHref: string
  primaryLabel: string
}) {
  return (
    <section className="relative isolate border-b" aria-labelledby="hero-title">
      <div aria-hidden className="landing-grid absolute inset-0 -z-20" />
      <div
        aria-hidden
        className="absolute top-[-12rem] left-1/2 -z-10 h-[32rem] w-[60rem] max-w-[110vw] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/[0.045]"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-18 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-14 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="landing-reveal max-w-2xl">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 border-primary/25 bg-primary/[0.06] px-2.5 font-mono text-[10px] tracking-[0.12em] text-primary uppercase"
            >
              Evidence-first candidate review
            </Badge>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              AI-assisted, recruiter-controlled
            </span>
          </div>

          <h1
            id="hero-title"
            className="text-[clamp(2.7rem,7.5vw,5.7rem)] leading-[0.92] font-semibold tracking-[-0.065em] text-balance"
          >
            Screen the proof.
            <span className="mt-2 block text-primary">Keep the judgment.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Compare one freelancer&apos;s resume and proposal against the role.
            See what is supported, what is missing, and where a recruiter should
            verify before moving forward.
          </p>

          <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
            <Button asChild size="lg" className="h-11 px-5 shadow-md">
              <Link href={primaryHref}>
                {primaryLabel}
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5">
              <Link href="#how-it-works">
                See how it works
                <IconArrowDown data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="mt-3 text-xs text-muted-foreground">
              Already have a workspace?{" "}
              <Link
                href="/login"
                className="font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
              >
                Sign in
              </Link>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-muted-foreground">
            {[
              "Private resumes",
              "Source-linked findings",
              "Human review required",
            ].map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="hidden size-0.5 rounded-full bg-border min-[430px]:block"
                  />
                )}
                {item}
              </span>
            ))}
          </div>
        </div>

        <DemoReport />
      </div>
    </section>
  )
}

function DemoReport() {
  return (
    <div
      id="product"
      className="landing-reveal landing-reveal-delay scroll-mt-24"
    >
      <div className="relative mx-auto max-w-2xl">
        <div
          aria-hidden
          className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/[0.05] blur-xl"
        />
        <Card className="gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card/96 py-0 shadow-2xl ring-1 shadow-foreground/[0.07] ring-foreground/[0.04]">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <IconFileSearch className="size-3.5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">
                  Candidate analysis
                </p>
                <p className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
                  Evidence trace / 003
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/[0.06] text-[9px] text-primary"
            >
              Demo report
            </Badge>
          </div>

          <div className="grid border-b sm:grid-cols-[1fr_auto]">
            <div className="grid gap-4 p-4 min-[420px]:grid-cols-2 sm:p-5">
              <DemoLabel label="Role" value="Full-stack TypeScript Engineer" />
              <DemoLabel label="Candidate" value="Maya Chen" />
            </div>
            <div className="flex items-center gap-4 border-t bg-muted/20 px-4 py-3 min-[420px]:px-5 sm:border-t-0 sm:border-l">
              <div className="text-center">
                <p className="font-mono text-2xl font-bold tracking-tight">
                  79
                </p>
                <p className="font-mono text-[9px] text-muted-foreground">
                  / 100
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Recommendation
                </p>
                <p className="mt-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Possible Fit
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">Requirement evidence</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Criteria mapped to submitted sources
                </p>
              </div>
              <span className="hidden font-mono text-[9px] tracking-widest text-muted-foreground uppercase min-[420px]:block">
                Trace status
              </span>
            </div>

            <div className="relative space-y-2.5 before:absolute before:top-5 before:bottom-5 before:left-[13px] before:w-px before:bg-border">
              <EvidenceRow
                marker="01"
                criterion="TypeScript"
                status="Matched"
                source="Resume"
                evidence="Built TypeScript services supporting multi-tenant workflows."
              />
              <EvidenceRow
                marker="02"
                criterion="Next.js"
                status="Matched"
                source="Proposal"
                evidence="References shipping three production Next.js applications."
              />
              <EvidenceRow
                marker="03"
                criterion="Kubernetes"
                status="Not found"
                source="Not found"
                evidence="Declared must-have; score capped at 79."
                missing
              />
            </div>

            <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium text-muted-foreground">
                    Proposal specificity
                  </span>
                  <span className="font-mono font-semibold">12 / 15</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-4/5 rounded-full bg-primary" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5 text-[10px]">
                <span className="font-medium text-muted-foreground">
                  Portfolio
                </span>
                <Badge variant="outline" className="h-4 px-1.5 text-[8px]">
                  Manual review
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t bg-muted/30 px-4 py-3 text-[10px] text-muted-foreground sm:items-center sm:px-5">
            <IconShieldCheck className="mt-px size-3.5 shrink-0 text-primary sm:mt-0" />
            Advisory result · Final decision remains with the recruiter
          </div>
        </Card>

        <div className="absolute -right-3 -bottom-6 hidden w-44 rounded-xl border bg-background/95 p-3 shadow-lg xl:block">
          <p className="font-mono text-[8px] tracking-widest text-primary uppercase">
            Trace complete
          </p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Every conclusion points to a source or an explicit gap.
          </p>
        </div>
      </div>
    </div>
  )
}

function EvidenceRow({
  marker,
  criterion,
  status,
  source,
  evidence,
  missing = false,
}: {
  marker: string
  criterion: string
  status: string
  source: string
  evidence: string
  missing?: boolean
}) {
  return (
    <div className="relative grid grid-cols-[27px_1fr] gap-2.5">
      <span
        className={cn(
          "relative z-10 flex size-[27px] items-center justify-center rounded-full border bg-card font-mono text-[8px] font-semibold",
          missing
            ? "border-destructive/40 text-destructive"
            : "border-primary/35 text-primary"
        )}
      >
        {marker}
      </span>
      <div
        className={cn(
          "rounded-lg border bg-background/50 p-3",
          missing && "border-destructive/25 bg-destructive/[0.025]"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold">{criterion}</p>
          <span
            className={cn(
              "flex items-center gap-1 text-[9px] font-semibold",
              missing
                ? "text-destructive"
                : "text-emerald-700 dark:text-emerald-300"
            )}
          >
            {missing ? (
              <IconCircleX className="size-3" />
            ) : (
              <IconCircleCheck className="size-3" />
            )}
            {status}
          </span>
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">
          <span className="font-semibold text-foreground">{source}</span>
          <span className="mx-1.5 text-border">/</span>“{evidence}”
        </p>
      </div>
    </div>
  )
}

function ProblemSection() {
  const problems = [
    "Important claims are scattered across documents.",
    "Missing evidence is easy to overlook.",
    "A score without its source is difficult to trust.",
  ]

  return (
    <section
      className="border-b bg-card/35 py-20 sm:py-28"
      aria-labelledby="problem-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <div>
          <SectionKicker>Why evidence first</SectionKicker>
          <h2
            id="problem-title"
            className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
          >
            Polished applications are easy. Documented fit is harder.
          </h2>
        </div>
        <div className="lg:pt-8">
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Recruiters have to reconcile role criteria, proposals, resumes,
            gaps, and follow-up questions. Evidence Screener structures that
            review without pretending to replace recruiter judgment.
          </p>
          <div className="mt-8 divide-y border-y">
            {problems.map((problem, index) => (
              <div key={problem} className="flex items-center gap-4 py-4">
                <span className="font-mono text-[10px] text-primary">
                  0{index + 1}
                </span>
                <p className="text-sm font-medium sm:text-base">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Define the role",
      copy: "Add the description, requirements, and explicit must-have skills that matter for this engagement.",
      icon: IconBriefcase,
    },
    {
      number: "02",
      title: "Add candidate evidence",
      copy: "Submit the proposal, one PDF resume, and an optional portfolio URL. The resume remains private.",
      icon: IconFileDescription,
    },
    {
      number: "03",
      title: "Review the evidence brief",
      copy: "Inspect supported criteria, missing evidence, the advisory score, recruiter review points, and grounded follow-up answers.",
      icon: IconUserCheck,
    },
  ] as const

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-20 sm:py-28"
      aria-labelledby="workflow-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="A focused workflow"
          title="One role. One candidate. A review you can trace."
          id="workflow-title"
          copy="The workspace keeps the job, submitted evidence, structured analysis, and recruiter judgment in one review path."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  {step.number}
                </span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/[0.07] text-primary ring-1 ring-primary/15">
                  <step.icon className="size-4" />
                </span>
              </div>
              <h3 className="mt-10 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.copy}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-2 rounded-xl border bg-muted/25 p-3 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center sm:text-center">
          {[
            "Role criteria",
            "Candidate evidence",
            "Structured report",
            "Human review",
          ].map((item, index) => (
            <div key={item} className="contents">
              <span className={cn(index === 3 && "text-primary")}>{item}</span>
              {index < 3 && (
                <IconArrowRight className="hidden size-3 text-border sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidenceTrace() {
  return (
    <section
      className="border-y bg-[oklch(0.12_0.012_245)] py-20 text-white sm:py-28"
      aria-labelledby="trace-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.76_0.15_190)] uppercase">
              The evidence trace
            </p>
            <h2
              id="trace-title"
              className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              From conclusion back to source.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base lg:justify-self-end">
            Every conclusion should have a visible path back to its source. The
            report shows what supports a criterion—and keeps absence explicit
            when the documents do not.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="grid lg:grid-cols-[1fr_7rem_0.82fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <TraceLabel icon={<IconFileDescription className="size-3.5" />}>
                Resume · Experience
              </TraceLabel>
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5 sm:p-6">
                <IconQuote className="size-5 text-white/25" />
                <p className="mt-4 font-mono text-sm leading-7 text-white/66 sm:text-base">
                  Led migration of a Node.js API to{" "}
                  <mark className="evidence-highlight rounded bg-[oklch(0.76_0.15_190)]/16 px-1 py-0.5 text-[oklch(0.86_0.1_190)]">
                    TypeScript
                  </mark>{" "}
                  and reduced deployment failures.
                </p>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[11px] text-white/45">
                <IconFingerprint className="size-3.5 text-[oklch(0.76_0.15_190)]" />
                Extracted resume text · source 01
              </p>
            </div>

            <div className="relative hidden items-center justify-center border-x border-white/10 lg:flex">
              <span className="trace-line absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-[oklch(0.76_0.15_190)]/45 bg-[oklch(0.12_0.012_245)] font-mono text-[10px] text-[oklch(0.76_0.15_190)] shadow-[0_0_0_8px_oklch(0.12_0.012_245)]">
                01
              </span>
            </div>

            <div className="border-t border-white/10 p-5 sm:p-8 lg:border-t-0 lg:p-10">
              <TraceLabel icon={<IconRoute className="size-3.5" />}>
                Mapped criterion
              </TraceLabel>
              <div className="mt-6">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-white/42 uppercase">
                  Requirement
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  Production TypeScript experience
                </h3>
                <div className="mt-7 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    <IconCircleCheck className="size-3.5" /> Supported
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55">
                    Source: Resume
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/10 lg:grid-cols-[1fr_7rem_0.82fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <TraceLabel icon={<IconFileSearch className="size-3.5" />}>
                Resume + proposal search
              </TraceLabel>
              <div className="mt-6 rounded-xl border border-dashed border-white/12 bg-black/15 p-5 sm:p-6">
                <p className="font-mono text-sm leading-7 text-white/48">
                  No supporting resume or proposal evidence was identified.
                </p>
              </div>
            </div>

            <div className="relative hidden items-center justify-center border-x border-white/10 lg:flex">
              <span className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-white/15" />
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-rose-400/35 bg-[oklch(0.12_0.012_245)] font-mono text-[10px] text-rose-300 shadow-[0_0_0_8px_oklch(0.12_0.012_245)]">
                02
              </span>
            </div>

            <div className="border-t border-white/10 p-5 sm:p-8 lg:border-t-0 lg:p-10">
              <TraceLabel icon={<IconRoute className="size-3.5" />}>
                Mapped criterion
              </TraceLabel>
              <p className="mt-6 text-[10px] font-semibold tracking-[0.12em] text-white/42 uppercase">
                Criterion
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Kubernetes operations
              </h3>
              <div className="mt-7">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-300">
                  <IconCircleX className="size-3.5" /> Not found
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="capabilities-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Inside the review"
          title="A structured brief, not a black-box verdict."
          id="capabilities-title"
          copy="The report organizes evidence, gaps, and next review points while keeping the final judgment with the recruiter."
        />

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <Card
              key={item.title}
              className={cn(
                "group relative min-h-64 justify-between overflow-hidden border border-border/80 bg-card p-6 py-6 shadow-none transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.04]",
                "className" in item ? item.className : undefined
              )}
            >
              <div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/[0.07] text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary/10">
                  <item.icon className="size-4" />
                </div>
                <h3 className="mt-7 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {item.detail}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Safeguards() {
  const safeguards = [
    "Human review required",
    "No automatic hiring decision",
    "No protected-characteristic inference",
    "No AI-authorship claims",
    "No generated interview questions",
    "Missing evidence remains visible",
    "Portfolio review remains manual",
    "Every stored resource is recruiter-owned",
  ]

  return (
    <section
      id="safeguards"
      className="scroll-mt-20 border-y bg-card/45 py-20 sm:py-28"
      aria-labelledby="safeguards-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div>
            <SectionKicker>Decision boundaries</SectionKicker>
            <h2
              id="safeguards-title"
              className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              Built to assist judgment—not replace it.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              The analysis can organize documented evidence. It cannot decide
              whether a person should be hired or rejected.
            </p>
            <div className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {safeguards.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-xs leading-5"
                >
                  <IconCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <DecisionBoundary />
        </div>
      </div>
    </section>
  )
}

function DecisionBoundary() {
  const aiActions = [
    "Organize evidence",
    "Identify documented gaps",
    "Draft advisory summaries",
    "Answer grounded questions",
  ]
  const recruiterActions = [
    "Whether evidence is sufficient",
    "What to verify",
    "Whether to continue",
    "What communication to send",
  ]

  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-xl shadow-foreground/[0.04]">
      <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <IconShieldCheck className="size-4 text-primary" />
          <span className="text-xs font-semibold">Decision boundary</span>
        </div>
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
          Human in control
        </span>
      </div>
      <div className="grid sm:grid-cols-2">
        <BoundaryColumn
          label="AI can"
          items={aiActions}
          icon={<IconSparkles className="size-4" />}
        />
        <BoundaryColumn
          label="Recruiter decides"
          items={recruiterActions}
          icon={<IconUserCheck className="size-4" />}
          primary
        />
      </div>
      <div className="border-t bg-primary/[0.045] px-5 py-3 text-center text-[10px] font-medium text-muted-foreground">
        Advisory analysis stops at the decision boundary.
      </div>
    </div>
  )
}

function BoundaryColumn({
  label,
  items,
  icon,
  primary = false,
}: {
  label: string
  items: readonly string[]
  icon: ReactNode
  primary?: boolean
}) {
  return (
    <div
      className={cn(
        "p-6",
        primary && "border-t bg-primary/[0.025] sm:border-t-0 sm:border-l"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-semibold",
          primary && "text-primary"
        )}
      >
        {icon}
        {label}
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={item} className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[8px]",
                primary
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span className="pt-0.5 text-xs leading-5">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Security() {
  const securityItems = [
    {
      title: "Email/password access",
      copy: "Product routes require an authenticated account before recruiter records can be accessed.",
      icon: IconLock,
    },
    {
      title: "Recruiter-owned records",
      copy: "Jobs, candidates, reports, and resume objects are scoped to their owner.",
      icon: IconFingerprint,
    },
    {
      title: "Row Level Security",
      copy: "Database policies reinforce account boundaries for every exposed table.",
      icon: IconDatabase,
    },
    {
      title: "Private resume storage",
      copy: "PDFs live in a private bucket with ownership checks repeated on the server.",
      icon: IconShieldCheck,
    },
    {
      title: "Text-only model input",
      copy: "PDF bytes stay out of the model. Only server-extracted text is analyzed.",
      icon: IconServer,
    },
    {
      title: "Bounded AI routes",
      copy: "Input limits and persistent per-recruiter rate limits constrain analysis and chat.",
      icon: IconRoute,
    },
  ] as const

  return (
    <section className="py-20 sm:py-28" aria-labelledby="security-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Private by design"
          title="Candidate documents deserve a private boundary."
          id="security-title"
          copy="The application combines account authentication, data policies, private file storage, and server checks to keep recruiter workspaces separated."
        />
        <div className="mt-12 grid gap-x-10 gap-y-0 border-y md:grid-cols-2 lg:grid-cols-3">
          {securityItems.map((item) => (
            <article
              key={item.title}
              className="flex gap-4 border-b py-6 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
                <item.icon className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y bg-card/35 py-20 sm:py-28"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:px-8">
        <div>
          <SectionKicker>Scope, clearly stated</SectionKicker>
          <h2
            id="faq-title"
            className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
          >
            Questions worth asking.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            The product is intentionally narrow: evidence review for one
            freelance candidate against one role.
          </p>
        </div>
        <div className="divide-y border-y">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:text-base">
                {faq.question}
                <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="max-w-3xl pb-5 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({
  isAuthenticated,
  primaryHref,
}: {
  isAuthenticated: boolean
  primaryHref: string
}) {
  const primaryLabel = isAuthenticated
    ? "Open dashboard"
    : "Create your workspace"

  return (
    <section
      className="relative isolate overflow-hidden py-20 sm:py-28"
      aria-labelledby="cta-title"
    >
      <div
        aria-hidden
        className="landing-grid absolute inset-0 -z-20 opacity-50"
      />
      <div
        aria-hidden
        className="absolute bottom-[-14rem] left-1/2 -z-10 h-[28rem] w-[50rem] max-w-[110vw] -translate-x-1/2 rounded-full bg-primary/[0.09] blur-3xl"
      />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <IconShieldCheck className="size-5" />
        </span>
        <h2
          id="cta-title"
          className="mt-7 text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl"
        >
          Start with the evidence.
          <span className="block text-primary">Decide with context.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
          Create a role, add a candidate, and review a source-linked screening
          report.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 min-[390px]:flex-row">
          <Button asChild size="lg" className="h-11 px-5 shadow-md">
            <Link href={primaryHref}>
              {primaryLabel}
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="ghost" className="h-11 px-5">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          A fully synthetic sample is available after authentication—no real
          candidate data required.
        </p>
      </div>
    </section>
  )
}

function LandingFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <footer className="border-t bg-[oklch(0.105_0.009_248)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
          <div>
            <Brand inverse />
            <p className="mt-4 max-w-md text-xs leading-6 text-white/55">
              A focused workspace for comparing freelance candidate evidence
              against the role while keeping judgment with the recruiter.
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs sm:grid-cols-3 lg:gap-x-10"
          >
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  Create account
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                Open dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] tracking-wide text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <span>AI-assisted analysis. Human review required.</span>
          <span>Evidence Screener · Recruiter-controlled review</span>
        </div>
      </div>
    </footer>
  )
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Evidence Screener home"
      className="inline-flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/20">
        <IconShieldCheck className="size-4 text-primary" />
      </span>
      <span>
        <span
          className={cn(
            "block text-[13px] leading-none font-semibold tracking-tight",
            inverse && "text-white"
          )}
        >
          Evidence Screener
        </span>
        <span className="mt-1 block font-mono text-[8px] leading-none font-semibold tracking-[0.13em] text-primary uppercase">
          Candidate evidence review
        </span>
      </span>
    </Link>
  )
}

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
      {children}
    </p>
  )
}

function SectionHeading({
  kicker,
  title,
  copy,
  id,
}: {
  kicker: string
  title: string
  copy: string
  id: string
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end">
      <div>
        <SectionKicker>{kicker}</SectionKicker>
        <h2
          id={id}
          className="mt-4 max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        >
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-sm leading-7 text-muted-foreground lg:justify-self-end">
        {copy}
      </p>
    </div>
  )
}

function DemoLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-semibold">{value}</p>
    </div>
  )
}

function TraceLabel({
  children,
  icon,
}: {
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[9px] font-semibold tracking-[0.12em] text-white/42 uppercase">
      <span className="text-[oklch(0.76_0.15_190)]">{icon}</span>
      {children}
    </div>
  )
}

function MiniResult({
  label,
  state,
  missing = false,
}: {
  label: string
  state: string
  missing?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2 text-[10px]">
      <span className="font-semibold">{label}</span>
      <span
        className={
          missing
            ? "text-destructive"
            : "text-emerald-700 dark:text-emerald-300"
        }
      >
        {state}
      </span>
    </div>
  )
}

function Meter({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">
          {value}/{max}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}
