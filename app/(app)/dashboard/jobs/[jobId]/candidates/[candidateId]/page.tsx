import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  IconArrowLeft,
  IconBriefcase,
  IconCircleCheck,
  IconCircleX,
  IconCopy,
  IconExternalLink,
  IconFileCheck,
  IconFileText,
  IconInfoCircle,
  IconLink,
  IconNotes,
  IconShield,
  IconSparkles,
} from "@tabler/icons-react"

import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { ResumeExtractionControl } from "@/components/resume-extraction-control"
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
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate screening details" }

interface RawReport {
  id: string
  score: number | null
  recommendation: string | null
  summary: string | null
  strengths: string[] | null
  weaknesses: string[] | null
  matched_skills: string[] | null
  missing_skills: string[] | null
  proposal_specificity_findings: any
  portfolio_evidence: any
  review_points: string[] | null
  outreach_message: string | null
  status: string
}

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
      .select("id, job_id, name, proposal_text, portfolio_url, resume_text, resume_path, analysis_status, analysis_error, created_at")
      .eq("id", candidateId)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("id, title")
      .eq("id", jobId)
      .maybeSingle(),
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

  const report = reportRaw as unknown as RawReport | null
  const hasReport = report !== null && report.status === "completed"

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
        <Button asChild size="sm" variant="ghost" className="text-muted-foreground self-start md:self-auto">
          <Link href={`/dashboard/jobs/${job.id}`}>
            <IconArrowLeft className="size-4 mr-1.5" />
            Back to candidates
          </Link>
        </Button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-card/40 border border-border/50 rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-sm">
        <div className="space-y-1">
          <p className="text-2xs font-semibold uppercase tracking-wider text-primary">
            Candidate Evaluation
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {candidate.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            Screening for:{" "}
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {job.title}
            </Link>
          </p>
        </div>

        {/* Fit score display inside hero */}
        {hasReport && report.score !== null && report.recommendation && (
          <div className="flex items-center gap-4 bg-muted/30 px-4 py-3 rounded-xl border border-border/40 self-start md:self-auto">
            <div className="space-y-0.5">
              <span className="block text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fit Score
              </span>
              <RecommendationBadge rec={report.recommendation} />
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-foreground border-l pl-4 border-border/40">
              {report.score}<span className="text-xs font-normal text-muted-foreground">/100</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* Left Area: Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue={hasReport ? "report" : "evidence"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="evidence">Candidate Evidence</TabsTrigger>
              <TabsTrigger value="report" disabled={!hasReport}>
                Fit Report
              </TabsTrigger>
            </TabsList>

            {/* Evidence tab content */}
            <TabsContent value="evidence" className="space-y-6 mt-4">
              {/* Proposal Cover Letter */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <IconNotes className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-semibold">Proposal Statement</CardTitle>
                      <CardDescription className="text-xs">
                        Submitted application text from the candidate.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground/90 font-sans">
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
                        <CardTitle className="text-base font-semibold">Extracted Resume Text</CardTitle>
                        <CardDescription className="text-xs">
                          Text indexed and ready for evidence verification.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ScrollArea className="h-96 pr-4 border rounded-lg bg-muted/10 p-4 font-mono text-xs text-muted-foreground">
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {candidate.resume_text}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-border/50 shadow-none bg-muted/15">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <IconFileText className="size-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">Resume text not extracted yet</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm leading-relaxed">
                      Before the candidate can be screened by the agent, we must extract raw text from their PDF resume.
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
                      <CardTitle className="text-base font-semibold">Portfolio Evidence Link</CardTitle>
                      <CardDescription className="text-xs">
                        Declared public URL. Text will be scraped for proof.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <a
                    className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors break-all underline underline-offset-4"
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
            <TabsContent value="report" className="space-y-6 mt-4">
              {hasReport && report && (
                <div className="space-y-6">
                  {/* Summary card */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="border-b pb-4 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="size-4.5 text-primary animate-pulse" />
                        <CardTitle className="text-base font-semibold">Executive Fit Summary</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <p className="text-sm leading-relaxed text-foreground/90 font-sans">
                        {report.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Strengths & Weaknesses side-by-side */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 border-b bg-emerald-500/5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
                          <IconCircleCheck className="size-4" /> Observed Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {report.strengths && report.strengths.length > 0 ? (
                          <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                            {report.strengths.map((str, idx) => (
                              <li key={idx} className="text-foreground/90">{str}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No clear strengths reported.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 border-b bg-destructive/5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-destructive">
                          <IconCircleX className="size-4" /> Identified Gaps
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {report.weaknesses && report.weaknesses.length > 0 ? (
                          <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                            {report.weaknesses.map((weak, idx) => (
                              <li key={idx} className="text-foreground/90">{weak}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No clear gaps or weaknesses reported.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Matched vs Missing Skills */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Matched Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {report.matched_skills && report.matched_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {report.matched_skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-normal">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No matched skills detected.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Missing Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {report.missing_skills && report.missing_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {report.missing_skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="border-destructive/20 bg-destructive/5 text-destructive font-normal">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No missing skills detected.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Outreach or rejection message template */}
                  {report.outreach_message && (
                    <Card className="border-border/50 shadow-sm">
                      <CardHeader className="border-b pb-4 flex flex-row items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base font-semibold">Suggested Outreach Email</CardTitle>
                          <CardDescription className="text-xs">
                            Personalized response generated from evidence fit findings.
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0">
                          <IconCopy className="size-3.5 mr-1" /> Copy Message
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-5">
                        <ScrollArea className="h-48 rounded-lg border bg-muted/20 p-4 font-mono text-xs text-muted-foreground leading-relaxed">
                          <p className="whitespace-pre-wrap">{report.outreach_message}</p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar: Status, resume action, metadata */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          {/* Metadata Card */}
          <Card size="sm" className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded bg-muted text-muted-foreground">
                  <IconFileCheck className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-xs font-semibold">Private Assets</CardTitle>
                  <CardDescription className="text-[10px]">PDF resume secure path</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div className="text-2xs text-muted-foreground break-all bg-muted/30 p-2 rounded border border-border/40 font-mono">
                {candidate.resume_path}
              </div>
              <div className="flex justify-between text-2xs text-muted-foreground pt-1">
                <span>Date uploaded:</span>
                <span className="font-medium text-foreground">
                  {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Processing and Extraction Status Control */}
          <Card className="border-border/50 shadow-sm" size="sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs font-semibold">Extraction Status</CardTitle>
                <AnalysisStatusBadge status={candidate.analysis_status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <CardDescription className="text-2xs leading-normal">
                {candidate.analysis_status === "ready" || candidate.analysis_status === "completed"
                  ? "Resume text extracted. Run fit analysis when deep agents are deployed."
                  : candidate.analysis_status === "failed"
                    ? "Resume extraction failed. Retry with a clean text-based PDF."
                    : "Extract resume text to make candidate evidence scannable."}
              </CardDescription>

              {candidate.analysis_error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-[11px] text-destructive leading-relaxed">
                  {candidate.analysis_error}
                </p>
              )}

              <Separator className="bg-border/40 my-1" />

              <ResumeExtractionControl
                candidateId={candidate.id}
                status={candidate.analysis_status}
              />
            </CardContent>
          </Card>

          {/* Planned Module Action (Run fit analysis) */}
          {candidate.analysis_status === "ready" && !hasReport && (
            <Card className="border-border/50 shadow-sm bg-gradient-to-br from-primary/5 via-card to-card border-l-primary/30" size="sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                  <IconSparkles className="size-4" /> Next Step
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-2xs text-muted-foreground leading-normal">
                  Agent analysis is the final step. The AI agent will inspect the resume evidence and portfolio relevance to score the candidate.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/80 text-xs py-1.5 h-8 font-semibold" disabled>
                  <IconShield className="size-3.5 mr-1" />
                  Run Fit Analysis
                </Button>
                <p className="text-3xs text-muted-foreground/60 text-center italic">
                  Note: Agent screening module remains planned.
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </section>
  )
}

function RecommendationBadge({
  rec,
}: {
  rec: string
}) {
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
  const item = config[rec] || { label: rec, className: "border-border bg-muted text-muted-foreground" }
  return (
    <Badge variant="outline" className={`text-3xs font-semibold px-2 py-0.5 ${item.className}`}>
      {item.label}
    </Badge>
  )
}
