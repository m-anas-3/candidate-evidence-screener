import type { ReactNode } from "react"
import Link from "next/link"
import {
  IconAlertTriangle,
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
  IconRoute,
  IconSearch,
  IconServer,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react"

import {
  MotionItem,
  MotionProgressBar,
  MotionReveal,
  MotionStagger,
  MotionTracePath,
} from "@/components/landing-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LandingIcon = typeof IconRoute

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/case-study", label: "Case study" },
  { href: "#safeguards", label: "Safeguards" },
  { href: "#faq", label: "FAQ" },
] as const

const capabilities: {
  title: string
  description: string
  icon: LandingIcon
}[] = [
  {
    title: "Requirement evidence",
    description:
      "Every criterion is reviewed against submitted resume and proposal text.",
    icon: IconRoute,
  },
  {
    title: "Must-have gaps",
    description:
      "Missing declared must-haves stay visible and cap the score at 79.",
    icon: IconAlertTriangle,
  },
  {
    title: "Proposal specificity",
    description:
      "The brief separates role-specific proposal detail from generic claims.",
    icon: IconSearch,
  },
  {
    title: "Strengths and weaknesses",
    description:
      "Supported advantages and material gaps are presented as separate lists.",
    icon: IconNotes,
  },
  {
    title: "Recruiter review points",
    description:
      "Uncertainty becomes a short list of claims to verify before moving on.",
    icon: IconUserCheck,
  },
  {
    title: "Editable outreach",
    description:
      "Draft outreach or rejection text remains editable before it is used.",
    icon: IconEdit,
  },
  {
    title: "Grounded follow-up chat",
    description:
      "Ask questions against the saved report and submitted source material.",
    icon: IconMessageCircle,
  },
  {
    title: "Manual portfolio review",
    description:
      "Portfolio URLs are kept for recruiter review; sites are not fetched or scored.",
    icon: IconExternalLink,
  },
]

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
    <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur-xl">
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
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {!isAuthenticated && (
            <Button asChild variant="ghost" className="text-sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild className="h-9 px-4 text-sm">
            <Link href={primaryHref}>
              {primaryLabel}
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </div>

        <details className="landing-menu relative sm:hidden">
          <summary className="flex size-9 list-none items-center justify-center rounded-full border bg-background text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
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
    <section className="relative border-b" aria-labelledby="hero-title">
      <div aria-hidden className="landing-grid absolute inset-0 opacity-45" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <MotionReveal className="max-w-2xl" onLoad>
          <Badge
            variant="outline"
            className="border-primary/25 bg-background px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-primary uppercase"
          >
            Evidence-first candidate review
          </Badge>
          <h1
            id="hero-title"
            className="mt-7 text-[clamp(3rem,7vw,6.2rem)] leading-[0.9] font-semibold tracking-[-0.07em] text-balance"
          >
            Screen the proof.
            <span className="block text-primary">Keep the judgment.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Compare one freelancer&apos;s resume and proposal against the role.
            See what is supported, what is missing, and where a recruiter should
            verify before moving forward.
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
            <Button asChild size="lg" className="h-11 px-5">
              <Link href={primaryHref}>
                {primaryLabel}
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5">
              <Link href="/case-study">
                View case study
                <IconArrowRight data-icon="inline-end" className="size-4" />
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
          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <TrustItem>Private resumes</TrustItem>
            <TrustItem>Source-linked findings</TrustItem>
            <TrustItem>Human review required</TrustItem>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} onLoad>
          <DemoReport />
        </MotionReveal>
      </div>
    </section>
  )
}

function DemoReport() {
  return (
    <div id="product" className="scroll-mt-24">
      <Card className="overflow-hidden rounded-2xl border bg-card py-0 shadow-xl shadow-foreground/[0.05]">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
              <IconFileSearch className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Candidate evidence brief
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                Demo report
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Advisory
          </Badge>
        </div>

        <div className="grid border-b md:grid-cols-4">
          <DemoMetric
            label="Role"
            value="Full-stack TypeScript Engineer"
            wide
          />
          <DemoMetric label="Candidate" value="Maya Chen" />
          <DemoMetric label="Score" value="79 / 100" />
          <DemoMetric label="Recommendation" value="Possible Fit" accent />
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_3.5rem_1fr]">
          <div className="space-y-3">
            <PanelLabel>Source excerpts</PanelLabel>
            <SourceExcerpt
              source="Resume"
              text="Built TypeScript services supporting multi-tenant workflows."
              marker="01"
            />
            <SourceExcerpt
              source="Proposal"
              text="References shipping three production Next.js applications."
              marker="02"
            />
            <SourceExcerpt
              source="Portfolio"
              text="URL retained for manual review. Content is not fetched."
              marker="Manual"
              muted
            />
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <MotionTracePath className="top-[4.7rem] right-0 left-0 h-px" />
            <MotionTracePath className="top-[10.5rem] right-0 left-0 h-px" />
            <span className="absolute top-[16.5rem] right-0 left-0 border-t border-dashed border-border" />
          </div>

          <div className="space-y-3">
            <PanelLabel>Mapped criteria</PanelLabel>
            <CriteriaResult
              title="TypeScript"
              status="Matched"
              source="Resume"
            />
            <CriteriaResult
              title="Next.js"
              status="Matched"
              source="Proposal"
            />
            <CriteriaResult
              title="Kubernetes"
              status="Not found"
              source="Declared must-have; score capped at 79"
              missing
            />
          </div>
        </div>

        <div className="grid gap-3 border-t bg-muted/25 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Proposal specificity
              </span>
              <span className="font-mono font-semibold">12 / 15</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <MotionProgressBar value={12} max={15} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-xs">
            <span className="font-medium text-muted-foreground">Portfolio</span>
            <Badge variant="outline" className="text-[10px]">
              Manual review
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-2 border-t px-4 py-3 text-xs text-muted-foreground sm:items-center sm:px-5">
          <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" />
          Advisory result · Final decision remains with the recruiter
        </div>
      </Card>
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
      className="border-b py-16 sm:py-24"
      aria-labelledby="problem-title"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <MotionReveal>
          <SectionKicker>Why this exists</SectionKicker>
          <h2
            id="problem-title"
            className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
          >
            Polished applications are easy. Documented fit is harder.
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.06}>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Recruiters have to reconcile role criteria, proposals, resumes,
            gaps, and follow-up questions. Evidence Screener structures that
            review without pretending to replace recruiter judgment.
          </p>
          <div className="mt-8 grid gap-3">
            {problems.map((problem, index) => (
              <div
                key={problem}
                className="grid grid-cols-[2.5rem_1fr] items-start gap-4 rounded-xl border bg-card p-4"
              >
                <span className="font-mono text-xs text-primary">
                  0{index + 1}
                </span>
                <p className="text-sm font-medium">{problem}</p>
              </div>
            ))}
          </div>
        </MotionReveal>
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
      className="scroll-mt-20 border-b bg-card/30 py-16 sm:py-24"
      aria-labelledby="workflow-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="How it works"
          title="One role. One candidate. One evidence brief."
          id="workflow-title"
          copy="The workspace keeps the job, submitted evidence, structured analysis, and recruiter judgment in one review path."
        />
        <MotionStagger className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <MotionItem key={step.number}>
              <StepCard {...step} />
            </MotionItem>
          ))}
        </MotionStagger>
        <div className="mt-6 grid gap-2 rounded-xl border bg-background p-3 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center sm:text-center">
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
    <section className="border-b py-16 sm:py-24" aria-labelledby="trace-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Evidence trace"
          title="From conclusion back to source."
          id="trace-title"
          copy="Every conclusion should have a visible path back to its source. When the documents do not support a criterion, the absence stays explicit."
        />

        <MotionReveal className="mt-10">
          <Card className="overflow-hidden rounded-2xl py-0">
            <div className="grid lg:grid-cols-[1fr_4rem_1fr]">
              <div className="p-5 sm:p-8">
                <PanelLabel>Source excerpt · Resume</PanelLabel>
                <div className="mt-5 rounded-xl border bg-muted/35 p-5 font-mono text-sm leading-7 text-muted-foreground">
                  Led migration of a Node.js API to{" "}
                  <mark className="rounded bg-primary/12 px-1 py-0.5 text-foreground">
                    TypeScript
                  </mark>{" "}
                  and reduced deployment failures.
                </div>
              </div>

              <div className="relative hidden items-center justify-center border-x lg:flex">
                <MotionTracePath className="right-0 left-0 h-px" />
                <span className="relative z-10 rounded-full border bg-background px-2 py-1 font-mono text-[10px] text-primary">
                  01
                </span>
              </div>

              <div className="border-t p-5 sm:p-8 lg:border-t-0">
                <PanelLabel>Mapped criterion</PanelLabel>
                <h3 className="mt-5 text-xl font-semibold">
                  Production TypeScript experience
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                    Supported
                  </Badge>
                  <Badge variant="outline">Source: Resume</Badge>
                </div>
              </div>
            </div>

            <div className="grid border-t lg:grid-cols-[1fr_4rem_1fr]">
              <div className="p-5 sm:p-8">
                <PanelLabel>Source search</PanelLabel>
                <div className="mt-5 rounded-xl border border-dashed bg-muted/25 p-5 font-mono text-sm leading-7 text-muted-foreground">
                  No supporting resume or proposal evidence was identified.
                </div>
              </div>
              <div className="relative hidden items-center justify-center border-x lg:flex">
                <span className="absolute right-0 left-0 border-t border-dashed border-border" />
                <span className="relative z-10 rounded-full border bg-background px-2 py-1 font-mono text-[10px] text-destructive">
                  02
                </span>
              </div>
              <div className="border-t p-5 sm:p-8 lg:border-t-0">
                <PanelLabel>Mapped criterion</PanelLabel>
                <h3 className="mt-5 text-xl font-semibold">
                  Kubernetes operations
                </h3>
                <div className="mt-5">
                  <Badge variant="destructive">Not found</Badge>
                </div>
              </div>
            </div>
          </Card>
        </MotionReveal>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section
      className="border-b py-16 sm:py-24"
      aria-labelledby="features-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Inside the report"
          title="A structured brief, not an opaque conclusion."
          id="features-title"
          copy="Evidence Screener organizes what is supported, what is missing, and what the recruiter should review next."
        />
        <MotionStagger className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <MotionItem key={item.title} className="bg-card">
              <article className="h-full p-5 sm:p-6">
                <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                  <item.icon className="size-4" />
                </div>
                <h3 className="mt-6 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
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
      className="scroll-mt-20 border-b bg-[oklch(0.115_0.01_245)] py-16 text-white sm:py-24"
      aria-labelledby="safeguards-title"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <MotionReveal>
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[oklch(0.76_0.15_190)] uppercase">
            Decision boundaries
          </p>
          <h2
            id="safeguards-title"
            className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
          >
            Built to assist judgment—not replace it.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            The analysis can organize documented evidence. It cannot decide
            whether a person should be hired or rejected.
          </p>
          <div className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {safeguards.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-xs">
                <IconCheck className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.76_0.15_190)]" />
                <span className="leading-5 text-white/78">{item}</span>
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.06}>
          <DecisionBoundary />
        </MotionReveal>
      </div>
    </section>
  )
}

function Security() {
  const securityItems = [
    {
      title: "Authentication required",
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
      title: "Private resume bucket",
      copy: "PDFs live in private Storage with ownership checks repeated on the server.",
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
    <section
      className="border-b py-16 sm:py-24"
      aria-labelledby="security-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Private boundary"
          title="Candidate documents deserve a clear boundary."
          id="security-title"
          copy="The application combines account authentication, data policies, private file storage, and server checks to keep recruiter workspaces separated."
        />
        <MotionStagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {securityItems.map((item) => (
            <MotionItem key={item.title}>
              <article className="h-full rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  {item.copy}
                </p>
              </article>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-b bg-card/30 py-16 sm:py-24"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:px-8">
        <MotionReveal>
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
        </MotionReveal>
        <MotionReveal delay={0.06}>
          <div className="divide-y rounded-2xl border bg-background px-4 sm:px-6">
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
        </MotionReveal>
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
    <section className="py-16 sm:py-24" aria-labelledby="cta-title">
      <MotionReveal className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <SectionKicker>Start with the evidence</SectionKicker>
        <h2
          id="cta-title"
          className="mt-4 text-4xl leading-[1.03] font-semibold tracking-[-0.055em] text-balance sm:text-6xl"
        >
          Decide with context.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
          Create a role, add a candidate, and review a source-linked screening
          report.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 min-[390px]:flex-row">
          <Button asChild size="lg" className="h-11 px-5">
            <Link href={primaryHref}>
              {primaryLabel}
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="outline" className="h-11 px-5">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          A fully synthetic sample is available after authentication—no real
          candidate data required.
        </p>
      </MotionReveal>
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
            {navItems.slice(0, 4).map((item) => (
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

function TrustItem({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  )
}

function DemoMetric({
  label,
  value,
  wide = false,
  accent = false,
}: {
  label: string
  value: string
  wide?: boolean
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "border-b p-4 md:border-r md:border-b-0",
        wide && "md:col-span-1"
      )}
    >
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-sm font-semibold",
          accent && "text-amber-700 dark:text-amber-300"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function SourceExcerpt({
  source,
  text,
  marker,
  muted = false,
}: {
  source: string
  text: string
  marker: string
  muted?: boolean
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] font-semibold text-primary">
          {marker}
        </span>
        <span className="text-[10px] text-muted-foreground">{source}</span>
      </div>
      <p
        className={cn(
          "mt-2 text-xs leading-5",
          muted ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {text}
      </p>
    </div>
  )
}

function CriteriaResult({
  title,
  status,
  source,
  missing = false,
}: {
  title: string
  status: string
  source: string
  missing?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-3",
        missing && "border-destructive/25 bg-destructive/[0.025]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">{title}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold",
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
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{source}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  copy,
  icon: Icon,
}: {
  number: string
  title: string
  copy: string
  icon: LandingIcon
}) {
  return (
    <article className="h-full rounded-2xl border bg-background p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-primary">
          {number}
        </span>
        <span className="flex size-9 items-center justify-center rounded-lg border bg-card text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <h3 className="mt-8 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
    </article>
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <IconShieldCheck className="size-4 text-[oklch(0.76_0.15_190)]" />
          <span className="text-sm font-semibold">Decision boundary</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-2">
        <BoundaryColumn label="AI can" items={aiActions} />
        <BoundaryColumn
          label="Recruiter decides"
          items={recruiterActions}
          primary
        />
      </div>
    </div>
  )
}

function BoundaryColumn({
  label,
  items,
  primary = false,
}: {
  label: string
  items: readonly string[]
  primary?: boolean
}) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6",
        primary &&
          "border-t border-white/10 bg-white/[0.035] sm:border-t-0 sm:border-l"
      )}
    >
      <p
        className={cn(
          "text-sm font-semibold",
          primary && "text-[oklch(0.76_0.15_190)]"
        )}
      >
        {label}
      </p>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border border-white/12 font-mono text-[8px] text-white/50",
                primary &&
                  "border-[oklch(0.76_0.15_190)]/35 text-[oklch(0.76_0.15_190)]"
              )}
            >
              {index + 1}
            </span>
            <span className="pt-0.5 text-xs leading-5 text-white/72">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
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

function SectionHeader({
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
    <MotionReveal className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end">
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
    </MotionReveal>
  )
}
