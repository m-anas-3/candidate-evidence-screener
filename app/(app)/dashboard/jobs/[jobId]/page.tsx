import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconArrowLeft,
  IconBriefcase,
  IconCircleCheck,
  IconFileText,
  IconPlus,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import { AddCandidateSheet } from "@/components/add-candidate-sheet"
import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { ClickableTableRow } from "@/components/clickable-table-row"
import { DeleteRecordButton } from "@/components/delete-record-button"
import { LocalDate } from "@/components/local-date"
import { RouteToast } from "@/components/route-toast"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Role details" }

export default async function JobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>
  searchParams: Promise<{ notice?: string }>
}) {
  const { jobId } = await params
  const { notice } = await searchParams
  const supabase = await createClient()

  const [{ data: authData }, { data: job, error: jobError }] =
    await Promise.all([
      supabase.auth.getClaims(),
      supabase
        .from("jobs")
        .select(
          "id, title, description, requirements, must_have_skills, created_at"
        )
        .eq("id", jobId)
        .maybeSingle(),
    ])

  const userId = authData?.claims?.sub

  if (jobError) {
    throw new Error("The role criteria could not be loaded.")
  }

  if (!job || !userId) {
    redirect("/dashboard/jobs?notice=role-unavailable")
  }

  // Load candidates for this job and join their screening reports
  const { data: candidates, error: candidateError } = await supabase
    .from("candidates")
    .select(
      `
      id,
      name,
      analysis_status,
      created_at,
      screening_reports (
        score,
        recommendation
      )
    `
    )
    .eq("job_id", job.id)
    .order("created_at", { ascending: false })

  if (candidateError) {
    throw new Error("Candidates could not be loaded.")
  }

  const reportsReadyCount = candidates.filter((c) => {
    const r = c.screening_reports
    const report = Array.isArray(r) ? r[0] : r
    return report?.score !== undefined && report?.score !== null
  }).length

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {notice === "job-created" && (
        <RouteToast id="job-created" message="Role created" />
      )}
      {notice === "candidate-deleted" && (
        <RouteToast id="candidate-deleted" message="Candidate deleted." />
      )}
      {/* Navigation Breadcrumbs */}
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
              <BreadcrumbPage>{job.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="self-start text-muted-foreground md:self-auto"
        >
          <Link href="/dashboard/jobs">
            <IconArrowLeft className="mr-1.5 size-4" />
            Back to roles
          </Link>
        </Button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/8 via-card to-card p-6 md:p-8">
        <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/5">
                <IconBriefcase className="size-5" />
              </span>
              <div>
                <p className="text-2xs font-semibold tracking-wider text-primary uppercase">
                  Role Criteria
                </p>
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {job.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className="text-2xs border-primary/20 bg-primary/5 font-medium text-primary"
              >
                Active Screening
              </Badge>
              <span>
                Created <LocalDate value={job.created_at} />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start">
            {/* Stats pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-3 py-1.5">
                <IconUsers className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {candidates.length}
                </span>
                <span className="text-muted-foreground">candidates</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5">
                <IconCircleCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {reportsReadyCount}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  ready
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Criteria details, Right is Summary */}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        {/* Left Side: Role Criteria details */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Job Criteria Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <DetailSection title="Description" value={job.description} />
            <Separator className="bg-border/30" />
            <DetailSection title="Requirements" value={job.requirements} />
            <Separator className="bg-border/30" />
            <div className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Must-have skills
              </h3>
              {job.must_have_skills.length ? (
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {job.must_have_skills.map((skill) => (
                    <li key={skill}>
                      <Badge
                        variant="secondary"
                        className="px-2.5 py-0.5 text-xs font-normal"
                      >
                        {skill}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  None specified.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side Info panel */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <IconUsers className="size-4" /> Candidates
                </span>
                <span className="font-semibold text-foreground">
                  {candidates.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <IconCircleCheck className="size-4 text-emerald-700 dark:text-emerald-400" />{" "}
                  Reports Ready
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {reportsReadyCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <IconFileText className="size-4 text-muted-foreground" />{" "}
                  Created
                </span>
                <span className="text-foreground">
                  <LocalDate value={job.created_at} display="month-day" />
                </span>
              </div>
              <Separator className="bg-border/30" />
              <AddCandidateSheet
                job={job}
                userId={userId}
                trigger={
                  <Button
                    className="w-full bg-primary font-semibold hover:bg-primary/85"
                    size="sm"
                  >
                    <IconPlus className="mr-1.5 size-3.5" />
                    Add candidate
                  </Button>
                }
              />
              <DeleteRecordButton
                id={job.id}
                name={job.title}
                recordType="role"
                redirectTo="/dashboard/jobs"
                showLabel
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidates section below */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Candidates for this role
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review and manage applicants matching this role criteria.
            </p>
          </div>
          <AddCandidateSheet job={job} userId={userId} />
        </div>

        {candidates.length > 0 ? (
          <Card className="overflow-hidden border-border/40 shadow-sm">
            <Table>
              <TableHeader className="border-b border-border/40 bg-muted/30">
                <TableRow>
                  <TableHead className="w-[35%] pl-6 text-xs font-semibold">
                    Candidate Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Screening Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Evidence Score
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Recommendation
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Date Added
                  </TableHead>
                  <TableHead className="w-[12%] pr-6 text-right text-xs font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => {
                  const r = candidate.screening_reports
                  const report = Array.isArray(r) ? r[0] : r
                  const hasReport = report !== undefined && report !== null

                  return (
                    <ClickableTableRow
                      key={candidate.id}
                      href={`/dashboard/jobs/${job.id}/candidates/${candidate.id}`}
                      navigationLabel={`Review ${candidate.name}`}
                      className="group hover:bg-muted/15"
                    >
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/10">
                            <IconUser className="size-3.5" />
                          </span>
                          <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {candidate.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AnalysisStatusBadge
                          status={candidate.analysis_status}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground/95">
                        {hasReport && report.score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${report.score}%`,
                                  backgroundColor:
                                    report.score >= 80
                                      ? "var(--chart-1)"
                                      : report.score >= 60
                                        ? "var(--chart-2)"
                                        : report.score >= 40
                                          ? "var(--chart-3)"
                                          : "var(--chart-5)",
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs">
                              {report.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasReport && report.recommendation ? (
                          <RecommendationBadge rec={report.recommendation} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <LocalDate value={candidate.created_at} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end">
                          <DeleteRecordButton
                            id={candidate.id}
                            name={candidate.name}
                            recordType="candidate"
                          />
                        </div>
                      </TableCell>
                    </ClickableTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-border/40">
            <CardContent className="flex min-h-56 flex-col items-center justify-center py-10 text-center">
              <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-border/30">
                <IconUser className="size-5" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                No candidates yet
              </h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Add candidates to this role. Upload a resume or paste candidate
                details, and the app will help you review fit against this job.
              </p>
              <div className="mt-4">
                <AddCandidateSheet
                  job={job}
                  userId={userId}
                  trigger={
                    <Button
                      className="bg-primary font-semibold hover:bg-primary/85"
                      size="sm"
                    >
                      <IconPlus className="mr-1.5 size-4" />
                      Add candidate
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

function DetailSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground/90">
        {value}
      </p>
    </div>
  )
}

function RecommendationBadge({
  rec,
}: {
  rec: "strong_fit" | "possible_fit" | "weak_fit"
}) {
  const config = {
    strong_fit: {
      label: "Strong documented match",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
    },
    possible_fit: {
      label: "Potential documented match",
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400",
    },
    weak_fit: {
      label: "Limited documented match",
      className:
        "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15",
    },
  }
  const item = config[rec]
  return (
    <Badge
      variant="outline"
      className={`text-2xs font-normal ${item.className}`}
    >
      {item.label}
    </Badge>
  )
}
