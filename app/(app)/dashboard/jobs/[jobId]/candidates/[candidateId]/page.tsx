import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconArrowLeft,
  IconBriefcase,
  IconExternalLink,
  IconFileText,
  IconLink,
  IconNotes,
  IconReportAnalytics,
} from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { CandidateAnalysisControl } from "@/components/candidate-analysis-control"
import { CandidateChat } from "@/components/candidate-chat"
import type { ChatMessage } from "@/components/candidate-chat"
import { CandidatePageTabs } from "@/components/candidate-page-tabs"
import { DeleteRecordButton } from "@/components/delete-record-button"
import { LocalDate } from "@/components/local-date"
import { ResumeExtractionControl } from "@/components/resume-extraction-control"
import { ScreeningReportView } from "@/components/screening-report-view"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { screeningReportSchema } from "@/lib/agent/report-schema"
import { validateReportMustHaveCoverage } from "@/lib/agent/report-validation"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate Evaluation" }

export default async function CandidateDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string; candidateId: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { jobId, candidateId } = await params
  const { from } = await searchParams
  const supabase = await createClient()

  const [
    { data: candidate, error: candidateError },
    { data: job, error: jobError },
    { data: reportRaw, error: reportError },
    { data: chatHistory },
  ] = await Promise.all([
    supabase
      .from("candidates")
      .select(
        "id, job_id, name, proposal_text, portfolio_url, resume_text, resume_path, analysis_status, analysis_error, created_at"
      )
      .eq("id", candidateId)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("id, title, must_have_skills")
      .eq("id", jobId)
      .maybeSingle(),
    supabase
      .from("screening_reports")
      .select("*")
      .eq("candidate_id", candidateId)
      .maybeSingle(),
    supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: true })
      .limit(50),
  ])

  if (
    candidateError ||
    !candidate ||
    candidate.job_id !== jobId ||
    jobError ||
    !job
  ) {
    redirect(
      from === "/dashboard/candidates"
        ? "/dashboard/candidates?notice=candidate-unavailable"
        : "/dashboard/jobs?notice=role-unavailable"
    )
  }

  const cameFromCandidates = from === "/dashboard/candidates"
  const backHref = cameFromCandidates
    ? "/dashboard/candidates"
    : `/dashboard/jobs/${job.id}`
  const backLabel = cameFromCandidates ? "Back to candidates" : "Back to role"

  const reportResult = screeningReportSchema.safeParse(
    reportRaw?.status === "completed" ? reportRaw.raw_structured_output : null
  )
  const report = reportResult.success
    ? validateReportMustHaveCoverage(
        reportResult.data,
        job.must_have_skills ?? []
      )
    : null
  const hasReport = report !== null
  const reportUnavailable =
    Boolean(reportError) ||
    (reportRaw?.status === "completed" && !reportResult.success)

  const initialChatMessages: ChatMessage[] = (chatHistory ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const recColors = {
    strong_fit: {
      label: "Strong documented match",
      ring: "border-primary/45",
      bg: "bg-primary/8",
      text: "text-primary",
      score: "text-primary",
    },
    possible_fit: {
      label: "Potential documented match",
      ring: "border-foreground/30",
      bg: "bg-surface-subtle",
      text: "text-foreground",
      score: "text-foreground",
    },
    weak_fit: {
      label: "Limited documented match",
      ring: "border-dashed border-foreground/50",
      bg: "bg-transparent",
      text: "text-foreground",
      score: "text-foreground",
    },
  }
  const rec = report?.recommendation ? recColors[report.recommendation] : null

  const evidencePanel = (
    <div className="space-y-5">
      {/* Proposal */}
      <Card className="border-border/40">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconNotes className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">
                Proposal Statement
              </CardTitle>
              <CardDescription className="text-xs">
                Submitted application text.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground/90">
            {candidate.proposal_text || (
              <span className="italic">No proposal text.</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Resume */}
      {candidate.resume_text ? (
        <Card className="border-border/40">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <IconFileText className="size-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">
                  Extracted Resume
                </CardTitle>
                <CardDescription className="text-xs">
                  Indexed text used for evidence analysis.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-80 rounded-lg border bg-muted/10 p-4 font-mono text-xs text-muted-foreground">
              <p className="leading-relaxed whitespace-pre-wrap">
                {candidate.resume_text}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-border/40 bg-muted/5">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <IconFileText className="mb-3 size-7 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Resume not extracted yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Extract resume text before running the AI analysis.
            </p>
            <div className="mt-4">
              <ResumeExtractionControl
                candidateId={candidate.id}
                status={candidate.analysis_status}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      <Card className="border-border/40">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <IconLink className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">
                Portfolio URL
              </CardTitle>
              <CardDescription className="text-xs">
                Optional link for manual recruiter review. It is not scored.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {candidate.portfolio_url ? (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium break-all text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {candidate.portfolio_url}
              <IconExternalLink className="size-3.5 shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No portfolio URL provided.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const reportPanel = report ? (
    <ScreeningReportView report={report} />
  ) : reportUnavailable ? (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-semibold text-destructive">
          Report unavailable
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          The stored report could not be validated. Unvalidated analysis is
          never displayed.
        </p>
      </CardContent>
    </Card>
  ) : (
    <Card className="border-border/40 bg-muted/5">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconReportAnalytics className="size-6" />
        </div>
        <p className="text-base font-semibold">No report yet</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {candidate.resume_text
            ? "Resume extracted. Run the fit analysis to generate an evidence-backed report."
            : "Extract the resume first, then run the fit analysis."}
        </p>
        {candidate.resume_text && (
          <div className="mt-5">
            <CandidateAnalysisControl
              candidateId={candidate.id}
              status={candidate.analysis_status}
            />
          </div>
        )}
        {!candidate.resume_text && (
          <div className="mt-5">
            <ResumeExtractionControl
              candidateId={candidate.id}
              status={candidate.analysis_status}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )

  const chatPanel = (
    <CandidateChat
      candidateId={candidate.id}
      hasReport={hasReport}
      initialMessages={initialChatMessages}
    />
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-0">
      <div className="mb-5 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/jobs">Roles</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/jobs/${job.id}`}>{job.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{candidate.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={backHref}>
              <IconArrowLeft className="mr-1.5 size-3.5" />
              {backLabel}
            </Link>
          </Button>
          <DeleteRecordButton
            id={candidate.id}
            name={candidate.name}
            recordType="candidate"
            redirectTo={backHref}
            showLabel
          />
        </div>
      </div>

      <div
        className={`mb-6 overflow-hidden rounded-2xl border-2 ${rec?.ring ?? "border-border/40"} ${rec?.bg ?? "bg-card/50"}`}
      >
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background/60 ring-1 ring-border/40 backdrop-blur-sm">
              <span className="text-xl font-bold text-foreground">
                {candidate.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {candidate.name}
                </h1>
                <AnalysisStatusBadge status={candidate.analysis_status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <IconBriefcase className="size-3.5" />
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {job.title}
                  </Link>
                </span>
                <span>
                  Added <LocalDate value={candidate.created_at} />
                </span>
              </div>
              {candidate.analysis_error && (
                <p className="mt-1 rounded-lg border border-destructive/20 bg-destructive/8 px-2.5 py-1 text-[11px] text-destructive">
                  {candidate.analysis_error}
                </p>
              )}
            </div>
          </div>

          {rec && report && (
            <div className="flex shrink-0 items-center gap-4 self-start rounded-xl bg-background/50 px-5 py-3.5 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Fit Score
                </p>
                <p
                  className={`mt-0.5 font-mono text-4xl leading-none font-black ${rec.score}`}
                >
                  {report.score}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
              <div className="h-10 w-px bg-border/40" />
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Recommendation
                </p>
                <p className={`mt-0.5 text-sm font-bold ${rec.text}`}>
                  {rec.label}
                </p>
                <p className="mt-0.5 max-w-[140px] text-[10px] leading-4 text-muted-foreground">
                  {report.summary.slice(0, 80)}
                  {report.summary.length > 80 ? "…" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {candidate.resume_text && !hasReport && (
          <div className="border-t border-border/30 bg-background/30 px-6 py-3">
            <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <p className="min-w-0 text-left text-xs leading-5 text-muted-foreground">
                Generate an evidence-backed fit report from the submitted
                materials.
              </p>
              <CandidateAnalysisControl
                candidateId={candidate.id}
                status={candidate.analysis_status}
              />
            </div>
          </div>
        )}
      </div>

      <CandidatePageTabs
        hasReport={hasReport}
        evidencePanel={evidencePanel}
        reportPanel={reportPanel}
        chatPanel={chatPanel}
      />
    </div>
  )
}
