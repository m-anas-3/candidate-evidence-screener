"use client"

import { useState } from "react"
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconExternalLink,
  IconMessageCircle,
  IconNotes,
  IconUserCheck,
} from "@tabler/icons-react"

import { OutreachMessageEditor } from "@/components/outreach-message-editor"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { EvidenceItem, ScreeningReport } from "@/lib/agent/report-schema"
import { getRecruiterBrief } from "@/lib/agent/report-presentation"

// ---------------------------------------------------------------------------
// Colour maps
// ---------------------------------------------------------------------------

const sourceLabels: Record<EvidenceItem["source"], string> = {
  not_found: "No evidence found",
  portfolio: "From portfolio",
  proposal: "From proposal",
  resume: "From resume",
}

const sourceStyles: Record<EvidenceItem["source"], string> = {
  resume: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  proposal:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  portfolio:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  not_found: "border-destructive/30 bg-destructive/10 text-destructive",
}

type Rec = ScreeningReport["recommendation"]

const recConfig: Record<
  Rec,
  { label: string; color: string; ring: string; bar: string }
> = {
  strong_fit: {
    label: "Strong documented match",
    color: "text-emerald-700 dark:text-emerald-400",
    ring: "border-emerald-500/40",
    bar: "bg-emerald-500",
  },
  possible_fit: {
    label: "Potential documented match",
    color: "text-amber-700 dark:text-amber-400",
    ring: "border-amber-500/40",
    bar: "bg-amber-500",
  },
  weak_fit: {
    label: "Limited documented match",
    color: "text-destructive",
    ring: "border-destructive/40",
    bar: "bg-destructive",
  },
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function ScreeningReportView({ report }: { report: ScreeningReport }) {
  const rec = recConfig[report.recommendation]
  const brief = getRecruiterBrief(report)
  const isLegacyReport = report.scoring.portfolioRelevance !== undefined

  return (
    <div className="space-y-4">
      {/* Keep the human-review requirement visible without leading with legal copy. */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground">
            Recruiter review required.
          </span>{" "}
          This assessment uses the candidate&apos;s submitted evidence. Verify
          key claims before deciding whether to proceed.
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Recruiter brief</CardTitle>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {brief.nextStep}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 md:grid-cols-3">
          <BriefItem
            label="Top supporting reasons"
            value={
              brief.supportingReasons.length
                ? brief.supportingReasons.map((item) => item.claim).join("; ")
                : "No supported reason was recorded."
            }
          />
          <BriefItem
            label="Most important gap"
            value={brief.mostImportantGap}
          />
          <BriefItem
            label="First verification action"
            value={brief.firstVerificationAction}
          />
        </CardContent>
      </Card>

      {/* Score hero */}
      <Card className={cn("border-2", rec.ring)}>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Recommendation and concise decision brief */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 bg-muted/20",
                  rec.ring
                )}
              >
                <span
                  className={cn(
                    "font-mono text-2xl leading-none font-black",
                    rec.color
                  )}
                >
                  {report.score}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  / 100
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Recommendation
                </p>
                <p className={cn("text-xl font-bold", rec.color)}>
                  {rec.label}
                </p>
                <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                  {report.summary}
                </p>
              </div>
            </div>

            {/* Sub-score bars */}
            <div className="w-full max-w-xs shrink-0 space-y-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Score breakdown
              </p>
              <ScoreBar
                label="Role requirements"
                value={report.scoring.jobRequirementsAndSkills}
                max={isLegacyReport ? 50 : 55}
                barClass={rec.bar}
              />
              <ScoreBar
                label="Relevant experience"
                value={report.scoring.relevantExperience}
                max={isLegacyReport ? 20 : 30}
                barClass={rec.bar}
              />
              <ScoreBar
                label="Tailored proposal"
                value={report.scoring.proposalSpecificity}
                max={15}
                barClass={rec.bar}
              />
              {isLegacyReport && (
                <ScoreBar
                  label="Portfolio (legacy report)"
                  value={report.scoring.portfolioRelevance ?? 0}
                  max={15}
                  barClass={rec.bar}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Requirements snapshot</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          What the submitted evidence does—and does not—support.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SkillPills
          title="Supported requirements"
          icon={
            <IconCircleCheck className="size-4 text-emerald-700 dark:text-emerald-400" />
          }
          items={report.matchedSkills.filter((i) => i.source !== "not_found")}
          emptyText="No supported requirements were identified."
        />
        <SkillPills
          title="Missing or unverified"
          icon={<IconCircleX className="size-4 text-destructive" />}
          items={report.missingSkills}
          emptyText="All must-have requirements have supporting evidence."
          emptyGood
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconNotes className="size-4 text-violet-700 dark:text-violet-400" />
              Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <p className="font-mono text-sm font-semibold">
              {report.scoring.proposalSpecificity}/15
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {report.proposalSpecificityFindings.summary}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconExternalLink className="size-4 text-primary" />
              {isLegacyReport
                ? "Portfolio (legacy report)"
                : "Portfolio — manual review"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {isLegacyReport && (
              <p className="font-mono text-sm font-semibold">
                {report.scoring.portfolioRelevance ?? 0}/15
              </p>
            )}
            {report.portfolioEvidence.inspectedUrl ? (
              <a
                href={report.portfolioEvidence.inspectedUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex max-w-full items-center gap-1 text-xs text-primary underline underline-offset-4"
              >
                <span className="truncate">
                  {report.portfolioEvidence.inspectedUrl}
                </span>
                <IconExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">Not provided.</p>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              {isLegacyReport
                ? report.portfolioEvidence.summary
                : "Not analyzed or scored. Review it manually if useful."}
            </p>
            {isLegacyReport && report.portfolioEvidence.findings.length > 0 && (
              <EvidenceItemList items={report.portfolioEvidence.findings} />
            )}
          </CardContent>
        </Card>
      </div>

      {report.reviewPoints.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconUserCheck className="size-4 text-primary" />
              Verify before progressing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {report.reviewPoints.slice(0, 3).map((item) => (
                <li key={item.claim}>{item.claim}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <CollapsibleSection
        title="Supporting evidence details"
        icon={<IconNotes className="size-4 text-muted-foreground" />}
        defaultOpen={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EvidenceList
            title="Strengths"
            items={report.strengths.slice(0, 3)}
          />
          <EvidenceList title="Gaps" items={report.weaknesses.slice(0, 3)} />
        </div>
      </CollapsibleSection>

      {/* Outreach draft — collapsible */}
      <CollapsibleSection
        title="Candidate message draft"
        icon={
          <IconMessageCircle className="size-4 text-sky-700 dark:text-sky-400" />
        }
        defaultOpen={false}
      >
        <p className="mb-3 text-xs text-muted-foreground">
          Edit this draft before using it. Nothing is sent automatically.
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
        {open ? (
          <IconChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <IconChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && <CardContent className="border-t pt-4">{children}</CardContent>}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Requirement list — readable evidence rows instead of tooltip-only chips
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
          <span className="flex size-7 items-center justify-center rounded bg-muted/50">
            {icon}
          </span>
          <CardTitle className="text-sm">{title}</CardTitle>
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {items.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {items.length === 0 ? (
          <p
            className={cn(
              "text-xs italic",
              emptyGood
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {emptyText}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li
                key={`${item.claim}-${i}`}
                className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs leading-5 font-semibold text-foreground">
                    {item.claim}
                  </span>
                  <Badge
                    className={cn(
                      "shrink-0 text-[9px]",
                      sourceStyles[item.source]
                    )}
                    variant="outline"
                  >
                    {sourceLabels[item.source]}
                  </Badge>
                </div>
                {item.source !== "not_found" && (
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {item.evidence}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// EvidenceList — titled list of items (for strengths/gaps inside collapsibles)
// ---------------------------------------------------------------------------

function EvidenceList({
  title,
  items,
}: {
  title: string
  items: EvidenceItem[]
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">None recorded.</p>
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
        <li
          key={`${item.claim}-${i}`}
          className="rounded-lg border border-border/40 bg-muted/10 p-3 transition-colors hover:bg-muted/20"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-xs leading-5 font-semibold text-foreground">
              {item.claim}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 border text-[10px] font-medium",
                sourceStyles[item.source]
              )}
            >
              {sourceLabels[item.source]}
            </Badge>
          </div>
          {item.source !== "not_found" && (
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              {item.evidence}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------

function ScoreBar({
  label,
  value,
  max,
  barClass,
}: {
  label: string
  value: number
  max: number
  barClass: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-foreground">
          {value}
          <span className="text-muted-foreground">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function BriefItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5 text-foreground">{value}</p>
    </div>
  )
}
