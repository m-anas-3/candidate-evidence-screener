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
  IconMessageCircle,
  IconNotes,
  IconRoute,
  IconServer,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react"

import { LandingHeader } from "@/components/landing-header"
import { MotionProgressBar, MotionTracePath } from "@/components/landing-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LandingIcon = typeof IconRoute

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safeguards", label: "Safeguards" },
  { href: "/case-study", label: "Case study" },
  { href: "#faq", label: "FAQ" },
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
        className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0 focus:outline-none"
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
        <TraceSection />
        <WorkflowSection />
        <DecisionSection />
        <SafeguardsSection />
        <FaqSection />
        <FinalCta primaryHref={primaryHref} isAuthenticated={isAuthenticated} />
      </main>

      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
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
      <PastelBlocks position="hero" />

      <div className="relative mx-auto max-w-[90rem] px-5 pt-20 pb-14 sm:px-8 sm:pt-28 sm:pb-20 lg:px-12 lg:pt-32">
        <div className="mx-auto max-w-[68rem] text-center">
          <p className="landing-eyebrow">Evidence-first candidate review</p>
          <h1
            id="hero-title"
            className="landing-display mt-7 text-[clamp(3.1rem,12vw,6rem)] leading-[0.84] font-normal tracking-[-0.07em] text-balance sm:text-[clamp(4.4rem,9.2vw,8.7rem)] sm:leading-[0.82]"
          >
            Screen the proof.
            <span className="block text-[0.91em] text-primary sm:text-[1em]">
              Keep the judgment.
            </span>
          </h1>
          <p className="mx-auto mt-9 max-w-[42rem] text-base leading-7 text-foreground/66 sm:text-xl sm:leading-8">
            Compare one freelancer&apos;s resume and proposal against the role.
            See what is supported, what is missing, and what deserves a closer
            look before you move forward.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 min-[400px]:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-6 text-sm shadow-[0_5px_0_rgba(66,28,79,0.12)] hover:bg-[color-mix(in_oklch,var(--primary),black_8%)]"
            >
              <Link href={primaryHref}>
                {primaryLabel}
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full bg-background px-6 text-sm shadow-none hover:bg-muted"
            >
              <Link href="/case-study">
                View case study
                <IconArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="mt-4 text-xs text-foreground/52">
              Already have a workspace?{" "}
              <Link
                href="/login"
                className="font-semibold text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>

        <div className="mx-auto mt-16 max-w-[78rem] sm:mt-20">
          <CandidateReportPreview />
        </div>

        <div className="mx-auto mt-11 grid max-w-[65rem] gap-5 border-t border-border pt-7 text-center text-[0.6875rem] font-semibold tracking-[0.08em] text-foreground/52 uppercase sm:grid-cols-3 sm:gap-0">
          <TrustStatement>Private resume storage</TrustStatement>
          <TrustStatement>Source-linked findings</TrustStatement>
          <TrustStatement>Human review required</TrustStatement>
        </div>
      </div>
    </section>
  )
}

function CandidateReportPreview() {
  return (
    <div
      id="product"
      className="landing-product-frame scroll-mt-28 overflow-hidden"
    >
      <ProductWindowHeader
        icon={IconFileSearch}
        label="Candidate evidence brief"
        meta="Synthetic example · Advisory"
      />

      <div className="grid border-b sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.7fr_0.9fr]">
        <ReportMetric label="Role" value="Full-stack TypeScript Engineer" />
        <ReportMetric label="Candidate" value="Maya Chen" />
        <ReportMetric label="Score" value="79 / 100" />
        <ReportMetric
          label="Recommendation"
          value="Possible Fit"
          tone="orchid"
        />
      </div>

      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b bg-[var(--landing-lavender)] p-5 sm:p-7 lg:border-r lg:border-b-0">
          <p className="landing-ui-label">Recruiter brief</p>
          <p className="mt-5 text-5xl leading-none font-semibold tracking-[-0.06em]">
            79
            <span className="ml-1 text-base font-medium tracking-normal text-foreground/45">
              /100
            </span>
          </p>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            Strong TypeScript and Next.js evidence. Kubernetes is a declared
            must-have but was not found in the submitted sources.
          </p>
          <div className="mt-6">
            <div className="flex items-center justify-between text-[0.6875rem] font-medium">
              <span className="text-foreground/55">Proposal specificity</span>
              <span>12 / 15</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <MotionProgressBar value={12} max={15} />
            </div>
          </div>
          <div className="mt-7 border-t border-foreground/12 pt-5">
            <p className="landing-ui-label">Review next</p>
            <div className="mt-3 flex items-start gap-2.5">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--landing-vermilion)]" />
              <p className="text-xs leading-5 text-foreground/68">
                Ask for evidence of production Kubernetes ownership.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <p className="landing-ui-label">Evidence mapped to criteria</p>
            <span className="text-[0.625rem] font-semibold tracking-[0.1em] text-foreground/42 uppercase">
              2 sources reviewed
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_3rem_1fr]">
            <div className="space-y-3">
              <SourceCard
                marker="01"
                source="Resume"
                text="Built TypeScript services supporting multi-tenant workflows."
              />
              <SourceCard
                marker="02"
                source="Proposal"
                text="References shipping three production Next.js applications."
              />
              <SourceCard
                marker="—"
                source="Resume + proposal"
                text="No production Kubernetes example was found."
                subdued
              />
            </div>

            <div className="relative hidden md:block" aria-hidden>
              <MotionTracePath className="top-[3.8rem] right-0 left-0 h-px" />
              <MotionTracePath className="top-[10.7rem] right-0 left-0 h-px" />
              <span className="absolute top-[17.6rem] right-0 left-0 border-t border-dashed border-foreground/20" />
            </div>

            <div className="space-y-3">
              <CriterionCard
                title="TypeScript"
                status="Matched"
                source="Resume"
              />
              <CriterionCard
                title="Next.js"
                status="Matched"
                source="Proposal"
              />
              <CriterionCard
                title="Kubernetes"
                status="Not found"
                source="Must-have · score capped at 79"
                missing
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t bg-[var(--landing-paper)] px-5 py-3.5 text-[0.6875rem] text-foreground/56 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <span className="inline-flex items-center gap-2">
          <IconShieldCheck className="size-4 text-primary" />
          Advisory result · Final decision remains with the recruiter
        </span>
        <span>Portfolio retained for manual review</span>
      </div>
    </div>
  )
}

function TraceSection() {
  return (
    <section className="border-b py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-24">
          <div>
            <SectionKicker number="1">Trace</SectionKicker>
            <h2 className="landing-display mt-5 max-w-[45rem] text-[clamp(3rem,6.2vw,6.3rem)] leading-[0.92] font-normal tracking-[-0.06em] text-balance">
              Every conclusion should point back to the source.
            </h2>
          </div>
          <div className="max-w-[37rem] lg:justify-self-end">
            <p className="text-lg leading-8 text-foreground/67 sm:text-xl">
              A polished application can make every claim sound certain.
              Evidence Screener keeps the resume, proposal, and job criteria in
              the same line of sight.
            </p>
            <p className="mt-5 text-sm leading-7 text-foreground/52">
              Supported criteria stay connected to their source. Missing
              evidence remains visible instead of being inferred.
            </p>
          </div>
        </div>

        <div className="mt-14 overflow-hidden border bg-card sm:mt-20">
          <div className="grid lg:grid-cols-[1fr_5rem_1fr]">
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between border-b pb-5">
                <p className="landing-ui-label">Submitted evidence</p>
                <span className="text-[0.6875rem] text-foreground/45">
                  Candidate-provided
                </span>
              </div>
              <TraceQuote
                number="01"
                source="Resume"
                quote="Built TypeScript services for multi-tenant workflows and maintained production Next.js applications."
                highlight="TypeScript services"
              />
              <TraceQuote
                number="02"
                source="Proposal"
                quote="I would begin by mapping the existing application boundaries before changing the data layer."
                highlight="mapping the existing application boundaries"
              />
              <div className="mt-6 flex items-center gap-3 border-t border-dashed pt-5 text-xs leading-5 text-foreground/52">
                <IconExternalLink className="size-4 shrink-0" />
                Portfolio URL is retained, but its content is not fetched or
                scored.
              </div>
            </div>

            <div
              className="relative hidden border-x bg-[var(--landing-paper)] lg:block"
              aria-hidden
            >
              <span className="absolute top-[8.4rem] left-1/2 h-[10.8rem] -translate-x-1/2 border-l border-foreground/20" />
              <span className="absolute top-[8.4rem] right-1/2 left-0 border-t border-foreground/20" />
              <span className="absolute top-[19.2rem] right-0 left-1/2 border-t border-foreground/20" />
              <span className="absolute top-[13.4rem] left-1/2 size-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-[var(--landing-orchid-soft)]" />
            </div>

            <div className="border-t bg-[var(--landing-sky)] p-5 sm:p-8 lg:border-t-0 lg:p-10">
              <div className="flex items-center justify-between border-b border-foreground/12 pb-5">
                <p className="landing-ui-label">Role criteria</p>
                <span className="text-[0.6875rem] text-foreground/45">
                  Evidence status
                </span>
              </div>
              <TraceResult
                icon={IconCircleCheck}
                title="TypeScript architecture"
                detail="Supported in resume"
                tone="positive"
              />
              <TraceResult
                icon={IconCircleCheck}
                title="Role-specific approach"
                detail="Supported in proposal"
                tone="positive"
              />
              <TraceResult
                icon={IconCircleX}
                title="Production Kubernetes"
                detail="Declared must-have · not found"
                tone="negative"
              />
              <div className="mt-7 flex items-center justify-between border-t border-foreground/12 pt-5">
                <div>
                  <p className="landing-ui-label">Scoring rule</p>
                  <p className="mt-1 text-sm font-semibold">
                    Must-have gap keeps the result below Strong Fit
                  </p>
                </div>
                <span className="landing-display text-5xl leading-none text-[var(--landing-vermilion)]">
                  79
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  const steps: {
    number: string
    title: string
    copy: string
    detail: string
    icon: LandingIcon
  }[] = [
    {
      number: "01",
      title: "Define the role",
      copy: "Add the job description, requirements, and explicit must-have skills.",
      detail: "The criteria become the review frame.",
      icon: IconBriefcase,
    },
    {
      number: "02",
      title: "Add candidate evidence",
      copy: "Submit the proposal, one PDF resume, and an optional portfolio URL.",
      detail: "The resume stays private; the portfolio stays manual.",
      icon: IconFileDescription,
    },
    {
      number: "03",
      title: "Review the brief",
      copy: "Inspect supported criteria, gaps, review points, and grounded follow-up answers.",
      detail: "The result informs the recruiter—it does not decide.",
      icon: IconUserCheck,
    },
  ]

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-b bg-[var(--landing-paper)] py-20 sm:py-28 lg:py-36"
      aria-labelledby="workflow-title"
    >
      <div className="mx-auto grid max-w-[90rem] gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-12">
        <div>
          <SectionKicker number="2">Review</SectionKicker>
          <h2
            id="workflow-title"
            className="landing-display mt-5 max-w-[40rem] text-[clamp(3rem,6vw,6rem)] leading-[0.92] font-normal tracking-[-0.06em] text-balance"
          >
            A focused path from role to evidence brief.
          </h2>
          <p className="mt-7 max-w-[35rem] text-base leading-8 text-foreground/62 sm:text-lg">
            One role. One candidate. One structured review path that keeps the
            submitted evidence and recruiter judgment distinct.
          </p>
        </div>

        <div className="border-t border-foreground/20">
          {steps.map((step) => (
            <article
              key={step.number}
              className="grid gap-5 border-b border-foreground/20 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:gap-7 sm:py-9"
            >
              <span className="text-xs font-semibold tracking-[0.12em] text-[var(--landing-vermilion)]">
                {step.number}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <step.icon className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-[34rem] text-sm leading-6 text-foreground/62">
                  {step.copy}
                </p>
              </div>
              <p className="max-w-[13rem] text-xs leading-5 text-foreground/43 sm:text-right">
                {step.detail}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[90rem] px-5 sm:mt-24 sm:px-8 lg:px-12">
        <WorkflowWorkspace />
      </div>
    </section>
  )
}

function WorkflowWorkspace() {
  return (
    <div className="relative overflow-hidden border bg-card">
      <ProductWindowHeader
        icon={IconRoute}
        label="Review workspace"
        meta="Role → evidence → report"
      />
      <div className="grid lg:grid-cols-[0.72fr_1fr_1.16fr]">
        <WorkspaceColumn
          number="01"
          label="Role"
          title="Full-stack TypeScript Engineer"
          color="peach"
        >
          <SmallField label="Must-have" value="TypeScript" />
          <SmallField label="Must-have" value="Next.js" />
          <SmallField label="Must-have" value="Kubernetes" />
        </WorkspaceColumn>
        <WorkspaceColumn
          number="02"
          label="Candidate evidence"
          title="Maya Chen"
          color="sky"
        >
          <FileRow icon={IconFileDescription} label="maya-chen-resume.pdf" />
          <FileRow icon={IconNotes} label="Proposal text added" />
          <FileRow icon={IconExternalLink} label="Portfolio · manual review" />
        </WorkspaceColumn>
        <WorkspaceColumn
          number="03"
          label="Evidence brief"
          title="Ready for recruiter review"
          color="orchid"
          last
        >
          <div className="grid grid-cols-3 gap-2">
            <CompactMetric label="Score" value="79" />
            <CompactMetric label="Matched" value="2" />
            <CompactMetric label="Review" value="1" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium">
            <span className="size-2 rounded-full bg-[var(--landing-orchid)]" />
            Possible Fit · Advisory
          </div>
        </WorkspaceColumn>
      </div>
    </div>
  )
}

function DecisionSection() {
  return (
    <section className="border-b py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-20">
          <div>
            <SectionKicker number="3">Decide</SectionKicker>
            <h2 className="landing-display mt-5 max-w-[52rem] text-[clamp(3rem,6.2vw,6.3rem)] leading-[0.92] font-normal tracking-[-0.06em] text-balance">
              The system organizes the case. You make the call.
            </h2>
          </div>
          <p className="max-w-[34rem] text-lg leading-8 text-foreground/64 lg:justify-self-end">
            Move from a structured brief to the exact points worth verifying,
            then ask grounded follow-up questions without changing the saved
            report.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-[1.08fr_0.92fr]">
          <RecruiterBriefPreview />
          <GroundedChatPreview />
        </div>

        <DecisionBoundary />
      </div>
    </section>
  )
}

function RecruiterBriefPreview() {
  return (
    <div className="overflow-hidden border bg-card">
      <ProductWindowHeader
        icon={IconNotes}
        label="Decision brief"
        meta="Recruiter review"
      />
      <div className="grid sm:grid-cols-2">
        <ReviewList
          title="Supported strengths"
          icon={IconCircleCheck}
          background="aquamarine"
          items={[
            "Production TypeScript service experience",
            "Job-specific Next.js delivery examples",
            "Proposal includes a concrete first step",
          ]}
        />
        <ReviewList
          title="Evidence gaps"
          icon={IconAlertTriangle}
          background="peach"
          items={[
            "Kubernetes ownership not found",
            "Scale of the referenced systems is unclear",
            "Portfolio content requires manual review",
          ]}
        />
      </div>
      <div className="grid border-t sm:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b p-5 sm:border-r sm:border-b-0 sm:p-7">
          <div className="flex items-center gap-2">
            <IconUserCheck className="size-4 text-primary" />
            <p className="landing-ui-label">Recruiter review point</p>
          </div>
          <p className="mt-4 text-sm leading-6">
            Ask for one production example that shows deployment ownership and
            operational responsibility.
          </p>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconEdit className="size-4 text-primary" />
              <p className="landing-ui-label">Editable outreach</p>
            </div>
            <span className="text-[0.625rem] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
              Draft
            </span>
          </div>
          <p className="mt-4 border-l-2 border-primary/35 pl-4 text-sm leading-6 text-foreground/65">
            Thanks for sharing your background. Before we continue, could you
            describe your hands-on Kubernetes experience in a production
            environment?
          </p>
        </div>
      </div>
    </div>
  )
}

function GroundedChatPreview() {
  return (
    <div className="flex min-h-[35rem] flex-col overflow-hidden border bg-[var(--landing-lavender)]">
      <ProductWindowHeader
        icon={IconMessageCircle}
        label="Grounded follow-up"
        meta="Read-only report context"
      />
      <div className="flex-1 p-5 sm:p-7">
        <div className="ml-auto max-w-[82%] bg-foreground px-4 py-3 text-sm leading-6 text-background">
          What is the biggest risk to verify before an interview?
        </div>
        <div className="mt-5 max-w-[92%] border border-foreground/12 bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground">
              <IconShieldCheck className="size-3.5" />
            </span>
            <p className="text-xs font-semibold">Evidence Screener</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-foreground/68">
            The clearest gap is production Kubernetes ownership. It is an
            explicit must-have, but neither the resume nor proposal provides a
            supporting example.
          </p>
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <p className="landing-ui-label">Sources used</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SourceTag>Resume</SourceTag>
              <SourceTag>Proposal</SourceTag>
              <SourceTag>Saved report</SourceTag>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-foreground/12 bg-card/70 p-4">
        <div className="flex items-center justify-between border border-foreground/12 bg-card px-4 py-3 text-xs text-foreground/42">
          Ask about the evidence brief…
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  )
}

function DecisionBoundary() {
  const aiActions = [
    "Organize submitted evidence",
    "Identify documented gaps",
    "Draft advisory language",
    "Answer grounded questions",
  ]
  const recruiterActions = [
    "Decide what is sufficient",
    "Choose what to verify",
    "Decide whether to continue",
    "Approve any communication",
  ]

  return (
    <div className="mt-5 grid border bg-foreground text-background lg:grid-cols-[0.72fr_1fr_1fr]">
      <div className="border-b border-background/15 p-6 lg:border-r lg:border-b-0 lg:p-8">
        <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-[var(--landing-peach)] uppercase">
          Decision boundary
        </p>
        <p className="landing-display mt-4 text-3xl leading-[1.02] tracking-[-0.04em]">
          Assistance stops where judgment begins.
        </p>
      </div>
      <BoundaryList label="The system can" items={aiActions} />
      <BoundaryList
        label="The recruiter decides"
        items={recruiterActions}
        emphasized
      />
    </div>
  )
}

function SafeguardsSection() {
  const safeguards: {
    title: string
    copy: string
    icon: LandingIcon
  }[] = [
    {
      title: "Authenticated access",
      copy: "Recruiter records require an authenticated account.",
      icon: IconLock,
    },
    {
      title: "Recruiter-scoped records",
      copy: "Jobs, candidates, reports, and resume objects are owner-scoped.",
      icon: IconFingerprint,
    },
    {
      title: "Private resume storage",
      copy: "PDFs remain in private Storage with server ownership checks.",
      icon: IconDatabase,
    },
    {
      title: "Text-only model input",
      copy: "PDF bytes stay out of the model; only extracted text is analyzed.",
      icon: IconServer,
    },
    {
      title: "Manual portfolio review",
      copy: "Portfolio sites are not fetched, analyzed, or scored.",
      icon: IconExternalLink,
    },
    {
      title: "Advisory output",
      copy: "The report supports human review and never makes the hiring decision.",
      icon: IconShieldCheck,
    },
  ]

  return (
    <section
      id="safeguards"
      className="scroll-mt-24 border-b bg-[var(--landing-sky)] py-20 sm:py-28 lg:py-36"
      aria-labelledby="safeguards-title"
    >
      <div className="mx-auto grid max-w-[90rem] gap-16 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-24 lg:px-12">
        <div>
          <SectionKicker number="4">Safeguard</SectionKicker>
          <h2
            id="safeguards-title"
            className="landing-display mt-5 max-w-[43rem] text-[clamp(3rem,6vw,6rem)] leading-[0.92] font-normal tracking-[-0.06em] text-balance"
          >
            A clear boundary around candidate evidence.
          </h2>
          <p className="mt-7 max-w-[37rem] text-base leading-8 text-foreground/64 sm:text-lg">
            Candidate documents move through a narrow, authenticated path. Every
            layer has a specific job, and the final decision remains outside the
            system.
          </p>

          <div className="mt-12 grid gap-x-8 border-t border-foreground/20 sm:grid-cols-2">
            {safeguards.map((item) => (
              <div
                key={item.title}
                className="border-b border-foreground/20 py-5"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="size-4.5 text-primary" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 pl-7 text-xs leading-5 text-foreground/55">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <PrivacyLayers />
      </div>
    </section>
  )
}

function PrivacyLayers() {
  return (
    <div className="relative min-h-[35rem] lg:min-h-[45rem]">
      <div
        aria-hidden
        className="absolute top-[3%] right-[4%] h-[30%] w-[82%] rotate-[3deg] border border-foreground/25 bg-[var(--landing-peach)]"
      />
      <div
        aria-hidden
        className="absolute top-[22%] left-[2%] h-[31%] w-[84%] -rotate-[2deg] border border-foreground/25 bg-[var(--landing-aquamarine)]"
      />
      <div
        aria-hidden
        className="absolute right-[1%] bottom-[19%] h-[31%] w-[86%] rotate-[1.5deg] border border-foreground/25 bg-[var(--landing-lavender)]"
      />

      <div className="absolute inset-x-[8%] top-[9%] border bg-card p-5 shadow-[12px_14px_0_rgba(24,22,20,0.08)] sm:p-7">
        <LayerHeader number="01" label="Recruiter account" icon={IconLock} />
        <p className="mt-5 text-sm leading-6 text-foreground/62">
          Authentication establishes the workspace boundary before jobs,
          candidates, or reports can be accessed.
        </p>
      </div>
      <div className="absolute inset-x-[3%] top-[36%] border bg-card p-5 shadow-[12px_14px_0_rgba(24,22,20,0.08)] sm:p-7">
        <LayerHeader
          number="02"
          label="Private candidate evidence"
          icon={IconFileDescription}
        />
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <span className="border bg-[var(--landing-paper)] p-3">
            Resume PDF
          </span>
          <span className="border bg-[var(--landing-paper)] p-3">
            Proposal text
          </span>
        </div>
      </div>
      <div className="absolute inset-x-[10%] top-[64%] border bg-foreground p-5 text-background shadow-[12px_14px_0_rgba(24,22,20,0.12)] sm:p-7">
        <LayerHeader
          number="03"
          label="Validated advisory report"
          icon={IconShieldCheck}
          inverse
        />
        <p className="mt-5 text-sm leading-6 text-background/67">
          Extracted text is analyzed, structured output is validated, and the
          recruiter receives an evidence brief—not an automatic decision.
        </p>
      </div>
    </div>
  )
}

function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-b py-20 sm:py-28 lg:py-36"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:gap-24 lg:px-12">
        <div>
          <SectionKicker>Scope, clearly stated</SectionKicker>
          <h2
            id="faq-title"
            className="landing-display mt-5 text-[clamp(3rem,5.5vw,5.6rem)] leading-[0.92] font-normal tracking-[-0.06em]"
          >
            Questions worth asking.
          </h2>
          <p className="mt-7 max-w-[28rem] text-sm leading-7 text-foreground/58">
            Evidence Screener is intentionally narrow: evidence review for one
            freelance candidate against one role.
          </p>
        </div>

        <div className="border-t border-foreground/25">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="faq-item group border-b border-foreground/25"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:py-7">
                <span className="flex gap-4 sm:gap-7">
                  <span className="pt-1 text-[0.625rem] font-semibold tracking-[0.1em] text-[var(--landing-vermilion)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-semibold tracking-[-0.02em] sm:text-lg">
                    {faq.question}
                  </span>
                </span>
                <IconChevronDown className="mt-1 size-5 shrink-0 text-foreground/45 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="max-w-[48rem] pb-7 pl-10 text-sm leading-7 text-foreground/62 sm:pl-14">
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
      className="relative overflow-hidden bg-[var(--landing-lavender)] py-24 sm:py-32 lg:py-40"
      aria-labelledby="cta-title"
    >
      <PastelBlocks position="cta" />
      <div className="relative mx-auto max-w-[64rem] px-5 text-center sm:px-8">
        <SectionKicker>Start with the evidence</SectionKicker>
        <h2
          id="cta-title"
          className="landing-display mt-6 text-[clamp(3.7rem,8vw,7.7rem)] leading-[0.86] font-normal tracking-[-0.07em] text-balance"
        >
          Finish with your judgment.
        </h2>
        <p className="mx-auto mt-8 max-w-[39rem] text-base leading-7 text-foreground/62 sm:text-lg">
          Create a role, add a candidate, and review a source-linked screening
          report with every important gap still visible.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 min-[400px]:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-6 text-sm shadow-[0_5px_0_rgba(66,28,79,0.12)] hover:bg-[color-mix(in_oklch,var(--primary),black_8%)]"
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <IconArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full bg-transparent px-6 text-sm shadow-none hover:bg-background/55"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
        <p className="mt-5 text-xs text-foreground/48">
          A fully synthetic sample is available after authentication—no real
          candidate data required.
        </p>
      </div>
    </section>
  )
}

function LandingFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <footer className="border-t border-foreground/15 bg-[var(--landing-lavender)]">
      <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-12 border-b border-foreground/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Brand />
            <p className="mt-5 max-w-[30rem] text-sm leading-6 text-foreground/56">
              A focused workspace for comparing freelance candidate evidence
              against the role while keeping judgment with the recruiter.
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3 lg:justify-self-end"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/60 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-foreground/60 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-foreground/60 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Create account
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-foreground/60 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Open dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[0.625rem] font-semibold tracking-[0.08em] text-foreground/42 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>AI-assisted analysis · Human review required</span>
          <span>Evidence Screener · Recruiter-controlled review</span>
        </div>
      </div>
    </footer>
  )
}

function ProductWindowHeader({
  icon: Icon,
  label,
  meta,
}: {
  icon: LandingIcon
  label: string
  meta: string
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center border bg-[var(--landing-paper)] text-primary">
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="text-[0.625rem] font-semibold tracking-[0.1em] text-foreground/42 uppercase">
        {meta}
      </p>
    </div>
  )
}

function ReportMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "orchid"
}) {
  return (
    <div className="border-b p-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0 lg:p-5">
      <p className="landing-ui-label">{label}</p>
      <p
        className={cn(
          "mt-2 truncate text-sm font-semibold",
          tone === "orchid" && "text-[var(--landing-orchid-ink)]"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SourceCard({
  marker,
  source,
  text,
  subdued = false,
}: {
  marker: string
  source: string
  text: string
  subdued?: boolean
}) {
  return (
    <div
      className={cn(
        "min-h-[6rem] border p-3.5",
        subdued
          ? "border-dashed bg-[var(--landing-paper)] text-foreground/55"
          : "bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-3 text-[0.625rem]">
        <span className="font-semibold tracking-[0.08em] text-primary uppercase">
          {marker}
        </span>
        <span className="text-foreground/45">{source}</span>
      </div>
      <p className="mt-2 text-xs leading-5">{text}</p>
    </div>
  )
}

function CriterionCard({
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
        "min-h-[6rem] border p-3.5",
        missing
          ? "border-[var(--landing-vermilion)]/35 bg-[var(--landing-peach)]/35"
          : "bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">{title}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[0.625rem] font-semibold",
            missing
              ? "text-[var(--landing-vermilion)]"
              : "text-[var(--landing-green)]"
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
      <p className="mt-3 text-xs leading-5 text-foreground/50">{source}</p>
    </div>
  )
}

function TraceQuote({
  number,
  source,
  quote,
  highlight,
}: {
  number: string
  source: string
  quote: string
  highlight: string
}) {
  const [before, after = ""] = quote.split(highlight)

  return (
    <blockquote className="mt-6 border-b border-foreground/12 pb-6">
      <div className="flex items-center justify-between text-[0.625rem] font-semibold tracking-[0.1em] uppercase">
        <span className="text-[var(--landing-vermilion)]">{number}</span>
        <span className="text-foreground/40">{source}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-foreground/68">
        {before}
        <mark className="bg-[var(--landing-aquamarine)] px-1 py-0.5 text-foreground">
          {highlight}
        </mark>
        {after}
      </p>
    </blockquote>
  )
}

function TraceResult({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: LandingIcon
  title: string
  detail: string
  tone: "positive" | "negative"
}) {
  return (
    <div className="flex items-start gap-4 border-b border-foreground/12 py-5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center border",
          tone === "positive"
            ? "border-[var(--landing-green)]/25 bg-[var(--landing-aquamarine)] text-[var(--landing-green)]"
            : "border-[var(--landing-vermilion)]/25 bg-[var(--landing-peach)] text-[var(--landing-vermilion)]"
        )}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-foreground/50">{detail}</p>
      </div>
    </div>
  )
}

function WorkspaceColumn({
  number,
  label,
  title,
  color,
  last = false,
  children,
}: {
  number: string
  label: string
  title: string
  color: "peach" | "sky" | "orchid"
  last?: boolean
  children: ReactNode
}) {
  const backgrounds = {
    peach: "bg-[var(--landing-peach)]/45",
    sky: "bg-[var(--landing-sky)]",
    orchid: "bg-[var(--landing-lavender)]",
  }

  return (
    <div
      className={cn(
        "border-b p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8",
        backgrounds[color],
        last && "border-b-0 lg:border-r-0"
      )}
    >
      <div className="flex items-center justify-between text-[0.625rem] font-semibold tracking-[0.1em] uppercase">
        <span className="text-[var(--landing-vermilion)]">{number}</span>
        <span className="text-foreground/42">{label}</span>
      </div>
      <h3 className="mt-6 min-h-12 text-lg leading-6 font-semibold tracking-[-0.02em]">
        {title}
      </h3>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-foreground/15 py-3 text-xs">
      <span className="text-foreground/45">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function FileRow({ icon: Icon, label }: { icon: LandingIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-foreground/15 py-3 text-xs font-medium">
      <Icon className="size-4 shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-foreground/12 bg-card/60 p-3">
      <p className="text-[0.5625rem] font-semibold tracking-[0.08em] text-foreground/40 uppercase">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  )
}

function ReviewList({
  title,
  icon: Icon,
  background,
  items,
}: {
  title: string
  icon: LandingIcon
  background: "aquamarine" | "peach"
  items: string[]
}) {
  return (
    <div
      className={cn(
        "border-b p-5 sm:p-7",
        background === "aquamarine"
          ? "bg-[var(--landing-aquamarine)]/42 sm:border-r"
          : "bg-[var(--landing-peach)]/42"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <p className="landing-ui-label">{title}</p>
      </div>
      <div className="mt-5 space-y-3.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/45" />
            <p className="text-xs leading-5 text-foreground/68">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SourceTag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-foreground/12 bg-[var(--landing-paper)] px-2 py-1 text-[0.625rem] font-medium text-foreground/55">
      {children}
    </span>
  )
}

function BoundaryList({
  label,
  items,
  emphasized = false,
}: {
  label: string
  items: string[]
  emphasized?: boolean
}) {
  return (
    <div
      className={cn(
        "border-b border-background/15 p-6 last:border-b-0 lg:border-r lg:border-b-0 lg:p-8 lg:last:border-r-0",
        emphasized && "bg-background/[0.07]"
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold",
          emphasized && "text-[var(--landing-aquamarine)]"
        )}
      >
        {label}
      </p>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-start gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-background/25 text-[0.5625rem] text-background/55">
              {index + 1}
            </span>
            <p className="pt-0.5 text-xs leading-5 text-background/68">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LayerHeader({
  number,
  label,
  icon: Icon,
  inverse = false,
}: {
  number: string
  label: string
  icon: LandingIcon
  inverse?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b pb-4",
        inverse ? "border-background/15" : "border-foreground/12"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "size-4",
            inverse ? "text-[var(--landing-aquamarine)]" : "text-primary"
          )}
        />
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <span
        className={cn(
          "text-[0.625rem] font-semibold tracking-[0.1em]",
          inverse ? "text-background/50" : "text-[var(--landing-vermilion)]"
        )}
      >
        {number}
      </span>
    </div>
  )
}

function TrustStatement({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 sm:border-r sm:last:border-r-0">
      <IconCheck className="size-3.5 text-primary" />
      {children}
    </p>
  )
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Evidence Screener home"
      className="inline-flex items-center gap-3 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <span className="flex size-8 items-center justify-center border border-foreground bg-foreground text-background">
        <IconShieldCheck className="size-4" />
      </span>
      <span>
        <span className="block text-[0.8125rem] leading-none font-semibold tracking-[-0.02em]">
          Evidence Screener
        </span>
        <span className="mt-1 block text-[0.5rem] leading-none font-semibold tracking-[0.14em] text-primary uppercase">
          Candidate evidence review
        </span>
      </span>
    </Link>
  )
}

function SectionKicker({
  number,
  children,
}: {
  number?: string
  children: ReactNode
}) {
  return (
    <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-[var(--landing-vermilion)] uppercase">
      {number ? `${number}. ` : ""}
      {children}
    </p>
  )
}

function PastelBlocks({ position }: { position: "hero" | "cta" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        position === "hero" ? "opacity-75" : "opacity-55"
      )}
    >
      {position === "hero" ? (
        <>
          <span className="landing-pastel-block absolute top-[8%] -left-12 h-16 w-24 bg-[var(--landing-lavender)] sm:left-0 sm:w-32" />
          <span className="landing-pastel-block landing-delay-1 absolute top-[14%] -left-4 h-10 w-48 bg-[var(--landing-sky)] sm:left-10" />
          <span className="landing-pastel-block landing-delay-2 absolute top-[23%] left-0 h-20 w-16 bg-[var(--landing-aquamarine)] sm:w-24" />
          <span className="landing-pastel-block landing-delay-3 absolute top-[10%] -right-8 h-24 w-24 bg-[var(--landing-peach)] sm:right-2 sm:w-36" />
          <span className="landing-pastel-block landing-delay-1 absolute top-[20%] -right-6 h-12 w-40 bg-[var(--landing-lavender)] sm:right-10" />
          <span className="landing-pastel-block landing-delay-2 absolute top-[27%] right-0 h-16 w-16 bg-[var(--landing-sky)] sm:w-24" />
        </>
      ) : (
        <>
          <span className="landing-pastel-block absolute top-[22%] -left-12 h-14 w-40 bg-[var(--landing-sky)] sm:left-4" />
          <span className="landing-pastel-block landing-delay-1 absolute top-[38%] left-0 h-20 w-24 bg-[var(--landing-aquamarine)] sm:w-36" />
          <span className="landing-pastel-block landing-delay-2 absolute top-[27%] -right-16 h-20 w-52 bg-[var(--landing-peach)] sm:right-2" />
          <span className="landing-pastel-block landing-delay-3 absolute top-[48%] right-0 h-12 w-32 bg-[var(--landing-sky)] sm:right-10" />
        </>
      )}
    </div>
  )
}
