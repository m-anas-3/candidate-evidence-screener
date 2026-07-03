import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  IconArrowLeft,
  IconBriefcase,
  IconExternalLink,
  IconFileText,
  IconLink,
  IconNotes,
  IconSparkles,
} from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { CandidateAnalysisControl } from "@/components/candidate-analysis-control"
import { CandidateChat } from "@/components/candidate-chat"
import type { ChatMessage } from "@/components/candidate-chat"
import { CandidatePageTabs } from "@/components/candidate-page-tabs"
import { DeleteRecordButton } from "@/components/delete-record-button"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { screeningReportSchema } from "@/lib/agent/report-schema"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate Evaluation" }

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string; candidateId: string }>
}) {
  const { jobId, candidateId } = await params
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
    supabase.from("jobs").select("id, title").eq("id", jobId).maybeSingle(),
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

  if (candidateError || !candidate) notFound()
  if (jobError || !job) notFound()

  const reportResult = screeningReportSchema.safeParse(
    reportRaw?.status === "completed" ? reportRaw.raw_structured_output : null
  )
  const report = reportResult.success ? reportResult.data : null
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
    strong_fit: { label: "Strong Fit", ring: "border-emerald-500/50", bg: "bg-emerald-500/8", text: "text-emerald-400", score: "text-emerald-400" },
    possible_fit: { label: "Possible Fit", ring: "border-amber-500/50", bg: "bg-amber-500/8", text: "text-amber-400", score: "text-amber-400" },
    weak_fit: { label: "Weak Fit", ring: "border-destructive/50", bg: "bg-destructive/8", text: "text-destructive", score: "text-destructive" },
  }
  const rec = report?.recommendation ? recColors[report.recommendation] : null

  // ── Panels ────────────────────────────────────────────────────────────────

  const evidencePanel = (
    <div className="space-y-5">
      {/* Proposal */}
      <Card className="border-border/40">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <IconNotes className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Proposal Statement</CardTitle>
              <CardDescription className="text-xs">Submitted application text.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground/90">
            {candidate.proposal_text || <span className="italic">No proposal text.</span>}
          </p>
        </CardContent>
      </Card>

      {/* Resume */}
      {candidate.resume_text ? (
        <Card className="border-border/40">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <IconFileText className="size-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Extracted Resume</CardTitle>
                <CardDescription className="text-xs">Indexed text used for evidence analysis.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-80 rounded-lg border bg-muted/10 p-4 font-mono text-xs text-muted-foreground">
              <p className="whitespace-pre-wrap leading-relaxed">{candidate.resume_text}</p>
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
              <ResumeExtractionControl candidateId={candidate.id} status={candidate.analysis_status} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      <Card className="border-border/40">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <IconLink className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Portfolio URL</CardTitle>
              <CardDescription className="text-xs">Scraped for evidence during analysis.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {candidate.portfolio_url ? (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 break-all"
            >
              {candidate.portfolio_url}
              <IconExternalLink className="size-3.5 shrink-0" />
            </a>
          ) : (
            <p className="text-sm italic text-muted-foreground">No portfolio URL provided.</p>
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
        <p className="text-sm font-semibold text-destructive">Report unavailable</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          The stored report could not be validated. Unvalidated analysis is never displayed.
        </p>
      </CardContent>
    </Card>
  ) : (
    <Card className="border-border/40 bg-muted/5">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconSparkles className="size-6" />
        </div>
        <p className="text-base font-semibold">No report yet</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {candidate.resume_text
            ? "Resume extracted. Run the fit analysis to generate an evidence-backed report."
            : "Extract the resume first, then run the fit analysis."}
        </p>
        {candidate.resume_text && (
          <div className="mt-5">
            <CandidateAnalysisControl candidateId={candidate.id} status={candidate.analysis_status} />
          </div>
        )}
        {!candidate.resume_text && (
          <div className="mt-5">
            <ResumeExtractionControl candidateId={candidate.id} status={candidate.analysis_status} />
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
      {/* ── Top navigation ─────────────────────────────────────────────────── */}
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
          <Button asChild size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link href={`/dashboard/jobs/${job.id}`}>
              <IconArrowLeft className="mr-1.5 size-3.5" />
              Back
            </Link>
          </Button>
          <DeleteRecordButton
            id={candidate.id}
            name={candidate.name}
            recordType="candidate"
            redirectTo={`/dashboard/jobs/${job.id}`}
            showLabel
          />
        </div>
      </div>

      {/* ── Candidate identity card ─────────────────────────────────────────── */}
      <div className={`mb-6 overflow-hidden rounded-2xl border-2 ${rec?.ring ?? "border-border/40"} ${rec?.bg ?? "bg-card/50"}`}>
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
          {/* Left — identity */}
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
                  <Link href={`/dashboard/jobs/${job.id}`} className="hover:text-primary transition-colors font-medium">
                    {job.title}
                  </Link>
                </span>
                <span>Added {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              {candidate.analysis_error && (
                <p className="mt-1 rounded-lg border border-destructive/20 bg-destructive/8 px-2.5 py-1 text-[11px] text-destructive">
                  {candidate.analysis_error}
                </p>
              )}
            </div>
          </div>

          {/* Right — score */}
          {rec && report && (
            <div className="flex shrink-0 items-center gap-4 self-start rounded-xl bg-background/50 px-5 py-3.5 ring-1 ring-border/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Fit Score</p>
                <p className={`mt-0.5 font-mono text-4xl font-black leading-none ${rec.score}`}>
                  {report.score}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
              <div className="h-10 w-px bg-border/40" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Verdict</p>
                <p className={`mt-0.5 text-sm font-bold ${rec.text}`}>{rec.label}</p>
                <p className="mt-0.5 max-w-[140px] text-[10px] leading-4 text-muted-foreground">
                  {report.summary.slice(0, 80)}{report.summary.length > 80 ? "…" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action bar at the bottom of the identity card */}
        {(candidate.resume_text && !hasReport) && (
          <div className="border-t border-border/30 bg-background/30 px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Resume extracted. Ready for AI fit analysis.
              </p>
              <CandidateAnalysisControl candidateId={candidate.id} status={candidate.analysis_status} />
            </div>
          </div>
        )}
      </div>

      {/* ── Tabbed content area ──────────────────────────────────────────────── */}
      <CandidatePageTabs
        hasReport={hasReport}
        candidateId={candidate.id}
        jobId={job.id}
        evidencePanel={evidencePanel}
        reportPanel={reportPanel}
        chatPanel={chatPanel}
      />
    </div>
  )
}
