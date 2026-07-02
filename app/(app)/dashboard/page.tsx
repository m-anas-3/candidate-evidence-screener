import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconBriefcase,
  IconChartBar,
  IconCircleCheck,
  IconClock,
  IconPlus,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react"

import {
  CandidatePipelineChart,
  ScoreDistributionChart,
} from "@/components/dashboard-charts"
import { CreateJobDialog } from "@/components/create-job-dialog"
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
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "At-a-glance screening progress and quick actions.",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Run stats queries in parallel
  const [
    jobsRes,
    candidatesRes,
    awaitingRes,
    reportsRes,
    recentJobsRes,
    allCandidatesRes,
    allReportsRes,
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .in("analysis_status", ["pending", "extracting", "processing"]),
    supabase
      .from("screening_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("jobs")
      .select("id, title, must_have_skills, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    // For charts: get all candidates with their analysis status
    supabase
      .from("candidates")
      .select("analysis_status, created_at"),
    // For score chart: get all screening report scores
    supabase
      .from("screening_reports")
      .select("score")
      .eq("status", "completed"),
  ])

  const totalJobs = jobsRes.count ?? 0
  const totalCandidates = candidatesRes.count ?? 0
  const awaitingAnalysis = awaitingRes.count ?? 0
  const reportsReady = reportsRes.count ?? 0
  const recentJobs = recentJobsRes.data ?? []
  const allCandidates = allCandidatesRes.data ?? []
  const allReports = allReportsRes.data ?? []

  // ─── Build chart data ─────────────────────────────────────────────────────
  // Pipeline chart: group candidates by status
  const statusCounts = allCandidates.reduce(
    (acc, c) => {
      const s = c.analysis_status as string
      if (s === "completed") acc.completed++
      else if (s === "ready") acc.ready++
      else if (s === "failed") acc.failed++
      else acc.pending++ // pending, extracting, processing
      return acc
    },
    { completed: 0, ready: 0, pending: 0, failed: 0 },
  )

  const pipelineData = [
    { label: "Pending", completed: 0, ready: 0, pending: statusCounts.pending, failed: 0 },
    { label: "Ready", completed: 0, ready: statusCounts.ready, pending: statusCounts.pending, failed: 0 },
    { label: "Analyzed", completed: statusCounts.completed, ready: statusCounts.ready, pending: statusCounts.pending, failed: statusCounts.failed },
  ]

  // Score distribution: bucket scores into ranges
  const scoreBuckets = [
    { range: "0–20", count: 0 },
    { range: "21–40", count: 0 },
    { range: "41–60", count: 0 },
    { range: "61–80", count: 0 },
    { range: "81–100", count: 0 },
  ]

  for (const r of allReports) {
    const s = r.score ?? 0
    if (s <= 20) scoreBuckets[0].count++
    else if (s <= 40) scoreBuckets[1].count++
    else if (s <= 60) scoreBuckets[2].count++
    else if (s <= 80) scoreBuckets[3].count++
    else scoreBuckets[4].count++
  }

  const hasChartData = allCandidates.length > 0
  const hasScoreData = allReports.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/8 via-card to-card p-6 md:p-8">
        <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary/3 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase flex items-center gap-1.5">
              <IconTrendingUp className="size-3.5" />
              Dashboard
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1.5">
              Recruiting Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Monitor candidate screening progress and manage your hiring pipeline at a glance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-border/50">
              <Link href="/dashboard/candidates">
                <IconUsers className="size-4 mr-1.5" />
                All candidates
              </Link>
            </Button>
            <CreateJobDialog />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconBriefcase className="size-4" />}
          iconColor="text-primary bg-primary/10"
          label="Open Roles"
          value={totalJobs}
          subtitle="Active job requirements"
        />
        <StatCard
          icon={<IconUsers className="size-4" />}
          iconColor="text-sky-400 bg-sky-500/10"
          label="Total Candidates"
          value={totalCandidates}
          subtitle="Uploaded resumes & proposals"
        />
        <StatCard
          icon={<IconClock className="size-4" />}
          iconColor="text-amber-400 bg-amber-500/10"
          label="Awaiting Analysis"
          value={awaitingAnalysis}
          subtitle="Pending extraction or screening"
          valueColor="text-amber-400"
        />
        <StatCard
          icon={<IconCircleCheck className="size-4" />}
          iconColor="text-emerald-400 bg-emerald-500/10"
          label="Reports Ready"
          value={reportsReady}
          subtitle="Fully analyzed evidence reports"
          valueColor="text-emerald-400"
        />
      </div>

      {/* Charts Row */}
      {(hasChartData || hasScoreData) && (
        <div className="grid gap-4 md:grid-cols-2">
          {hasChartData && (
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconTrendingUp className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold">Candidate Pipeline</CardTitle>
                    <CardDescription className="text-xs">
                      Distribution across screening stages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <CandidatePipelineChart data={pipelineData} />
              </CardContent>
            </Card>
          )}
          {hasScoreData && (
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconChartBar className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold">Score Distribution</CardTitle>
                    <CardDescription className="text-xs">
                      Fit scores across all analyzed candidates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <ScoreDistributionChart data={scoreBuckets} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Jobs list */}
        <Card className="flex flex-col border-border/40 shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Your active roles</CardTitle>
                <CardDescription className="text-xs">
                  Quick shortcuts to recently defined job criteria.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-2xs font-normal">
                {totalJobs} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            {recentJobs.length > 0 ? (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="group flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-primary/15 transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {job.must_have_skills.length > 0
                          ? job.must_have_skills.slice(0, 3).join(" · ")
                          : "No must-have skills"}
                      </p>
                    </div>
                    <span className="flex size-7 items-center justify-center rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200 text-muted-foreground">
                      <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
                <div className="pt-3">
                  <Button asChild size="sm" variant="outline" className="w-full border-border/40">
                    <Link href="/dashboard/jobs">View all roles</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground mb-3">
                  <IconBriefcase className="size-5" />
                </span>
                <p className="text-sm font-semibold">No roles created yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Create your first job posting to start uploading and analyzing candidates.
                </p>
                <div className="mt-4">
                  <CreateJobDialog
                    trigger={
                      <Button size="sm" className="bg-primary hover:bg-primary/85">
                        <IconPlus className="size-3.5 mr-1" />
                        Create role
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-semibold">How it works</CardTitle>
            <CardDescription className="text-xs">
              Follow this workflow to evaluate candidates with evidence-based screening.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <StepGuide
              step={1}
              title="Create a Role"
              description="Specify description, requirements, and must-have skills to anchor candidate analysis."
            />
            <Separator className="bg-border/30" />
            <StepGuide
              step={2}
              title="Upload Candidate Evidence"
              description="Provide candidate name, proposal cover letter, portfolio link, and a PDF resume."
            />
            <Separator className="bg-border/30" />
            <StepGuide
              step={3}
              title="Extract Resume Text"
              description="Extract and persist candidate resume text directly in the platform before screening."
            />
            <Separator className="bg-border/30" />
            <StepGuide
              step={4}
              title="Review Evidence Report"
              description="Inspect the structured fit score, strengths/weaknesses list, and follow up in chat."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  valueColor,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: number
  subtitle: string
  valueColor?: string
}) {
  return (
    <Card className="group relative overflow-hidden border-border/40 shadow-sm hover:shadow-md hover:border-primary/15 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardDescription className="text-xs font-medium uppercase tracking-wider">
          {label}
        </CardDescription>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconColor}`}>
          {icon}
        </span>
      </CardHeader>
      <CardContent className="relative">
        <div className={`text-3xl font-bold tracking-tight ${valueColor ?? "text-foreground"}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function StepGuide({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-2 ring-primary/5">
        {step}
      </span>
      <div className="pt-0.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
