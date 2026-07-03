import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  IconArrowLeft,
  IconExternalLink,
  IconFileCheck,
  IconFileText,
  IconLink,
  IconNotes,
  IconSparkles,
} from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { CandidateAnalysisControl } from "@/components/candidate-analysis-control"
import { ResumeExtractionControl } from "@/components/resume-extraction-control"
import { ScreeningReportView } from "@/components/screening-report-view"
import { Badge } from "@/components/ui/badge"
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { screeningReportSchema } from "@/lib/agent/report-schema"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate screening details" }

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string; candidateId: string }>
}) {
  const { jobId, candidateId } = await params
  const supabase = await createClient()

  // Load candidate, job, and screening report
  const [
    { data: candidate, error: candidateError },
    { data: job, error: jobError },
    { data: reportRaw, error: reportError },
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
  ])

  if (candidateError || !candidate) {
    notFound()
  }

  if (jobError || !job) {
    notFound()
  }

  const reportResult = screeningReportSchema.safeParse(
    reportRaw?.status === "completed" ? reportRaw.raw_structured_output : null
  )
  const report = reportResult.success ? reportResult.data : null
  const hasReport = report !== null
  const reportUnavailable =
    Boolean(reportError) ||
    (reportRaw?.status === "completed" && !reportResult.success)

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
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
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="self-start text-muted-foreground md:self-auto"
        >
          <Link href={`/dashboard/jobs/${job.id}`}>
            <IconArrowLeft className="mr-1.5 size-4" />
            Back to candidates
          </Link>
        </Button>
      </div>

      {/* Hero Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-2xs font-semibold tracking-wider text-primary uppercase">
            Candidate Evaluation
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {candidate.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            Screening for:{" "}
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              {job.title}
            </Link>
          </p>
        </div>

        {/* Fit score display inside hero */}
        {hasReport && report.score !== null && report.recommendation && (
          <div className="flex items-center gap-4 self-start rounded-xl border border-border/40 bg-muted/30 px-4 py-3 md:self-auto">
            <div className="space-y-0.5">
              <span className="text-3xs block font-semibold tracking-wider text-muted-foreground uppercase">
                Fit Score
              </span>
              <RecommendationBadge rec={report.recommendation} />
            </div>
            <div className="border-l border-border/40 pl-4 font-mono text-3xl font-black tracking-tight text-foreground">
              {report.score}
              <span className="text-xs font-normal text-muted-foreground">
                /100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* Left Area: Tabs */}
        <div className="space-y-6">
          <Tabs
            defaultValue={hasReport ? "report" : "evidence"}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="evidence">Candidate Evidence</TabsTrigger>
              <TabsTrigger value="report" disabled={!hasReport}>
                Fit Report
              </TabsTrigger>
            </TabsList>

            {/* Evidence tab content */}
            <TabsContent value="evidence" className="mt-4 space-y-6">
              {/* Proposal Cover Letter */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <IconNotes className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Proposal Statement
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Submitted application text from the candidate.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground/90">
                    {candidate.proposal_text}
                  </p>
                </CardContent>
              </Card>

              {/* Extracted Resume */}
              {candidate.resume_text ? (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="border-b pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                        <IconFileText className="size-4.5" />
                      </span>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Extracted Resume Text
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Text indexed and ready for evidence verification.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ScrollArea className="h-96 rounded-lg border bg-muted/10 p-4 pr-4 font-mono text-xs text-muted-foreground">
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {candidate.resume_text}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-border/50 bg-muted/15 shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <IconFileText className="mb-3 size-8 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      Resume text not extracted yet
                    </p>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground/80">
                      Before the candidate can be screened by the agent, we must
                      extract raw text from their PDF resume.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Portfolio Link */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                      <IconLink className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Portfolio Evidence Link
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Declared public URL. Text will be scraped for proof.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <a
                    className="inline-flex max-w-full items-center gap-2 text-sm font-medium break-all text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                    href={candidate.portfolio_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {candidate.portfolio_url}
                    <IconExternalLink className="size-4 shrink-0" />
                  </a>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Screening Report tab content */}
            <TabsContent value="report" className="mt-4 space-y-6">
              {report ? <ScreeningReportView report={report} /> : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar: Status, resume action, metadata */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          {/* Metadata Card */}
          <Card size="sm" className="border-border/50 shadow-sm">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded bg-muted text-muted-foreground">
                  <IconFileCheck className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-xs font-semibold">
                    Private Assets
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    PDF resume secure path
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="text-2xs rounded border border-border/40 bg-muted/30 p-2 font-mono break-all text-muted-foreground">
                {candidate.resume_path}
              </div>
              <div className="text-2xs flex justify-between pt-1 text-muted-foreground">
                <span>Date uploaded:</span>
                <span className="font-medium text-foreground">
                  {new Date(candidate.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm" size="sm">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs font-semibold">
                  Screening status
                </CardTitle>
                <AnalysisStatusBadge status={candidate.analysis_status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <CardDescription className="text-2xs leading-normal">
                {candidate.analysis_status === "completed"
                  ? "Evidence analysis completed. Human review is required."
                  : candidate.analysis_status === "processing"
                    ? "The agent is reviewing all four evidence sources."
                    : candidate.resume_text
                      ? "Resume evidence is ready for fit analysis."
                      : "Extract resume text before running analysis."}
              </CardDescription>
              {candidate.analysis_error ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-[11px] text-destructive">
                  {candidate.analysis_error}
                </p>
              ) : null}
              {!candidate.resume_text ? (
                <>
                  <Separator />
                  <ResumeExtractionControl
                    candidateId={candidate.id}
                    status={candidate.analysis_status}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>

          {candidate.resume_text && !hasReport ? (
            <Card className="border-primary/30 bg-primary/5" size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs text-primary">
                  <IconSparkles className="size-4" />
                  Evidence analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  The report compares the job with resume, proposal, and safely
                  inspected portfolio evidence.
                </p>
                <CandidateAnalysisControl
                  candidateId={candidate.id}
                  status={candidate.analysis_status}
                />
              </CardContent>
            </Card>
          ) : null}

          {reportUnavailable ? (
            <Card className="border-destructive/30 bg-destructive/5" size="sm">
              <CardHeader>
                <CardTitle className="text-xs text-destructive">
                  Report unavailable
                </CardTitle>
                <CardDescription className="text-xs leading-5">
                  The stored report could not be validated. Unvalidated analysis
                  is never displayed.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function RecommendationBadge({ rec }: { rec: string }) {
  const config: Record<string, { label: string; className: string }> = {
    strong_fit: {
      label: "Strong Fit",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    possible_fit: {
      label: "Possible Fit",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    weak_fit: {
      label: "Weak Fit",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
  }
  const item = config[rec] || {
    label: rec,
    className: "border-border bg-muted text-muted-foreground",
  }
  return (
    <Badge
      variant="outline"
      className={`text-3xs px-2 py-0.5 font-semibold ${item.className}`}
    >
      {item.label}
    </Badge>
  )
}
