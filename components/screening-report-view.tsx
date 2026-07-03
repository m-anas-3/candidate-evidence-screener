"use client"

import { useState } from "react"
import {
  IconAlertTriangle,
  IconBriefcase,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconExternalLink,
  IconMessageCircle,
  IconNotes,
  IconShieldCheck,
  IconStar,
  IconUserCheck,
} from "@tabler/icons-react"

import { OutreachMessageEditor } from "@/components/outreach-message-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { EvidenceItem, ScreeningReport } from "@/lib/agent/report-schema"

// ---------------------------------------------------------------------------
// Colour maps
// ---------------------------------------------------------------------------

const sourceLabels: Record<EvidenceItem["source"], string> = {
  not_found: "Not found",
  portfolio: "Portfolio",
  proposal: "Proposal",
  resume: "Resume",
}

const sourceStyles: Record<EvidenceItem["source"], string> = {
  resume: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  proposal: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  portfolio: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  not_found: "border-destructive/30 bg-destructive/10 text-destructive",
}

type Rec = ScreeningReport["recommendation"]

const recConfig: Record<Rec, { label: string; color: string; ring: string; bar: string }> = {
  strong_fit: { label: "Strong Fit", color: "text-emerald-400", ring: "border-emerald-500/40", bar: "bg-emerald-500" },
  possible_fit: { label: "Possible Fit", color: "text-amber-400", ring: "border-amber-500/40", bar: "bg-amber-500" },
  weak_fit: { label: "Weak Fit", color: "text-destructive", ring: "border-destructive/40", bar: "bg-destructive" },
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function ScreeningReportView({ report }: { report: ScreeningReport }) {
  const rec = recConfig[report.recommendation]

  return (
    <div className="space-y-4">
      {/* Advisory banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground">Advisory only.</span>{" "}
          Scores reflect documented evidence. A human must review every source
          before any hiring decision.
        </p>
      </div>

      {/* Score hero */}
      <Card className={cn("border-2", rec.ring)}>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Score ring */}
            <div className="flex items-center gap-4">
              <div className={cn("flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 bg-muted/20", rec.ring)}>
                <span className={cn("font-mono text-2xl font-black leading-none", rec.color)}>{report.score}</span>
                <span className="text-[10px] font-medium text-muted-foreground">/ 100</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fit Score</p>
                <p className={cn("text-xl font-bold", rec.color)}>{rec.label}</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{report.summary}</p>
              </div>
            </div>

            {/* Sub-score bars */}
            <div className="w-full max-w-xs shrink-0 space-y-2.5">
              <ScoreBar label="Skills & Requirements" value={report.scoring.jobRequirementsAndSkills} max={50} barClass={rec.bar} />
              <ScoreBar label="Relevant Experience" value={report.scoring.relevantExperience} max={20} barClass={rec.bar} />
              <ScoreBar label="Proposal Specificity" value={report.scoring.proposalSpecificity} max={15} barClass={rec.bar} />
              <ScoreBar label="Portfolio Relevance" value={report.scoring.portfolioRelevance} max={15} barClass={rec.bar} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills — always visible, no collapse */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkillPills
          title="Matched Skills"
          icon={<IconCircleCheck className="size-4 text-emerald-400" />}
          items={report.matchedSkills.filter((i) => i.source !== "not_found")}
          emptyText="None recorded."
        />
        <SkillPills
          title="Missing Must-Haves"
          icon={<IconCircleX className="size-4 text-destructive" />}
          items={report.missingSkills}
          emptyText="None — all must-haves covered."
          emptyGood
        />
      </div>

      {/* Strengths & Gaps — collapsible */}
      <CollapsibleSection
        title="Strengths & Evidence Gaps"
        icon={<IconStar className="size-4 text-amber-400" />}
        defaultOpen={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EvidenceList title="Strengths" items={report.strengths} />
          <EvidenceList title="Gaps" items={report.weaknesses} />
        </div>
      </CollapsibleSection>

      {/* Proposal & Portfolio — collapsible */}
      <CollapsibleSection
        title="Proposal & Portfolio Detail"
        icon={<IconNotes className="size-4 text-violet-400" />}
        defaultOpen={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* Proposal specificity */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Proposal Specificity{" "}
              <span className="font-mono text-foreground">{report.scoring.proposalSpecificity}/15</span>
            </p>
            <p className="text-xs leading-5 text-muted-foreground">{report.proposalSpecificityFindings.summary}</p>
            <SignalList title="Specific signals" values={report.proposalSpecificityFindings.specificSignals} positive />
            <SignalList title="Template signals" values={report.proposalSpecificityFindings.templateSignals} positive={false} />
          </div>

          {/* Portfolio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Portfolio Relevance{" "}
                <span className="font-mono text-foreground">{report.scoring.portfolioRelevance}/15</span>
              </p>
              <PortfolioStatusBadge status={report.portfolioEvidence.status} />
            </div>
            {report.portfolioEvidence.inspectedUrl && (
              <a
                href={report.portfolioEvidence.inspectedUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4 hover:text-primary/80"
              >
                <span className="max-w-[220px] truncate">{report.portfolioEvidence.inspectedUrl}</span>
                <IconExternalLink className="size-3 shrink-0" />
              </a>
            )}
            <p className="text-xs leading-5 text-muted-foreground">{report.portfolioEvidence.summary}</p>
            {report.portfolioEvidence.findings.length > 0 && (
              <EvidenceItemList items={report.portfolioEvidence.findings} />
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Review points — collapsible, only when present */}
      {report.reviewPoints.length > 0 && (
        <CollapsibleSection
          title={`Human Review Points (${report.reviewPoints.length})`}
          icon={<IconUserCheck className="size-4 text-primary" />}
          defaultOpen={false}
        >
          <EvidenceItemList items={report.reviewPoints} />
        </CollapsibleSection>
      )}

      {/* Outreach draft — collapsible */}
      <CollapsibleSection
        title="Outreach / Rejection Draft"
        icon={<IconMessageCircle className="size-4 text-sky-400" />}
        defaultOpen={false}
      >
        <p className="mb-3 text-xs text-muted-foreground">
          Editable draft. Review before copying — nothing is sent automatically.
        </p>
        <OutreachMessageEditor message={report.outreachMessage} />
      </CollapsibleSection>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CollapsibleSection
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="border-border/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/20"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {title}
        </span>
        {open
          ? <IconChevronUp className="size-4 text-muted-foreground" />
          : <IconChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open && (
        <CardContent className="border-t pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// SkillPills — compact chip list for matched/missing skills
// ---------------------------------------------------------------------------

function SkillPills({
  title,
  icon,
  items,
  emptyText,
  emptyGood = false,
}: {
  title: string
  icon: React.ReactNode
  items: EvidenceItem[]
  emptyText: string
  emptyGood?: boolean
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded bg-muted/50">{icon}</span>
          <CardTitle className="text-sm">{title}</CardTitle>
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {items.length === 0 ? (
          <p className={cn("text-xs italic", emptyGood ? "text-emerald-400" : "text-muted-foreground")}>{emptyText}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={`${item.claim}-${i}`}
                title={item.source !== "not_found" ? item.evidence : undefined}
                className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", sourceStyles[item.source])}
              >
                {item.claim}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// EvidenceList — titled list of items (for strengths/gaps inside collapsibles)
// ---------------------------------------------------------------------------

function EvidenceList({ title, items }: { title: string; items: EvidenceItem[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">None recorded.</p>
      ) : (
        <EvidenceItemList items={items} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// EvidenceItemList — raw list of evidence items
// ---------------------------------------------------------------------------

function EvidenceItemList({ items }: { items: EvidenceItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={`${item.claim}-${i}`} className="rounded-lg border border-border/40 bg-muted/10 p-3 hover:bg-muted/20 transition-colors">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-xs font-semibold leading-5 text-foreground">{item.claim}</p>
            <Badge
              variant="outline"
              className={cn("shrink-0 border text-[10px] font-medium", sourceStyles[item.source])}
            >
              {sourceLabels[item.source]}
            </Badge>
          </div>
          {item.source !== "not_found" && (
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.evidence}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------

function ScoreBar({ label, value, max, barClass }: { label: string; value: number; max: number; barClass: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-foreground">
          {value}<span className="text-muted-foreground">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div className={cn("h-full rounded-full transition-all", barClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SignalList
// ---------------------------------------------------------------------------

function SignalList({ title, values, positive }: { title: string; values: string[]; positive: boolean }) {
  if (!values.length) return null
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <ul className="space-y-1">
        {values.map((v) => (
          <li key={v} className="flex items-start gap-2 text-xs">
            {positive
              ? <IconShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              : <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />}
            <span className="text-muted-foreground">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PortfolioStatusBadge
// ---------------------------------------------------------------------------

function PortfolioStatusBadge({ status }: { status: "inspected" | "unavailable" | "unsafe" }) {
  const styles = {
    inspected: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    unavailable: "border-muted-foreground/20 bg-muted/30 text-muted-foreground",
    unsafe: "border-destructive/30 bg-destructive/10 text-destructive",
  }
  return (
    <Badge variant="outline" className={cn("border text-[10px] font-medium", styles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
