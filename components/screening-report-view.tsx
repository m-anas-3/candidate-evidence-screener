import { IconAlertTriangle } from "@tabler/icons-react"
import { OutreachMessageEditor } from "@/components/outreach-message-editor"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { EvidenceItem, ScreeningReport } from "@/lib/agent/report-schema"

const labels: Record<EvidenceItem["source"], string> = {
  not_found: "Not found",
  portfolio: "Portfolio",
  proposal: "Proposal",
  resume: "Resume",
}

export function ScreeningReportView({ report }: { report: ScreeningReport }) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex gap-3 pt-5">
          <IconAlertTriangle className="size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Advisory screening only</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              This score measures documented evidence against the job. A human
              must review every source before making a hiring decision.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Evidence summary</CardTitle>
          <CardDescription>{report.summary}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Score
            label="Requirements and skills"
            value={report.scoring.jobRequirementsAndSkills}
            total={50}
          />
          <Score
            label="Relevant experience"
            value={report.scoring.relevantExperience}
            total={20}
          />
          <Score
            label="Proposal specificity"
            value={report.scoring.proposalSpecificity}
            total={15}
          />
          <Score
            label="Portfolio relevance"
            value={report.scoring.portfolioRelevance}
            total={15}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <EvidenceCard title="Observed strengths" items={report.strengths} />
        <EvidenceCard title="Evidence gaps" items={report.weaknesses} />
        <EvidenceCard title="Matched skills" items={report.matchedSkills} />
        <EvidenceCard title="Missing must-haves" items={report.missingSkills} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proposal specificity</CardTitle>
            <CardDescription>
              {report.proposalSpecificityFindings.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Signals
              title="Specific signals"
              values={report.proposalSpecificityFindings.specificSignals}
            />
            <Signals
              title="Generic or template signals"
              values={report.proposalSpecificityFindings.templateSignals}
            />
            <EvidenceList items={report.proposalSpecificityFindings.evidence} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio evidence</CardTitle>
            <CardDescription>
              {report.portfolioEvidence.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="outline">{report.portfolioEvidence.status}</Badge>
              <Badge variant="secondary">
                {report.portfolioEvidence.score}/15
              </Badge>
            </div>
            <p className="text-xs break-all text-muted-foreground">
              {report.portfolioEvidence.inspectedUrl ?? "not found"}
            </p>
            <EvidenceList items={report.portfolioEvidence.findings} />
          </CardContent>
        </Card>
      </div>
      <EvidenceCard title="Human review points" items={report.reviewPoints} />
      <Card>
        <CardHeader>
          <CardTitle>Editable outreach or rejection draft</CardTitle>
          <CardDescription>
            Review and edit before copying. Nothing is sent automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OutreachMessageEditor message={report.outreachMessage} />
        </CardContent>
      </Card>
    </div>
  )
}

function Score({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold">
        {value}
        <span className="text-xs font-normal text-muted-foreground">
          /{total}
        </span>
      </p>
    </div>
  )
}
function EvidenceCard({
  title,
  items,
}: {
  title: string
  items: EvidenceItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EvidenceList items={items} />
      </CardContent>
    </Card>
  )
}
function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (!items.length)
    return <p className="text-xs text-muted-foreground italic">not found</p>
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          className="border-l-2 border-border/60 pl-3"
          key={`${item.claim}-${index}`}
        >
          <div className="flex flex-wrap justify-between gap-2">
            <p className="text-sm font-medium">{item.claim}</p>
            <Badge
              variant={item.source === "not_found" ? "destructive" : "outline"}
            >
              {labels[item.source]}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {item.evidence}
          </p>
        </li>
      ))}
    </ul>
  )
}
function Signals({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold">{title}</p>
      {values.length ? (
        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">not found</p>
      )}
    </div>
  )
}
