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
  AnalysisProgressChart,
  ScoreDistributionChart,
} from "@/components/dashboard-charts"
import { CreateJobDialog } from "@/components/create-job-dialog"
import { CreateSyntheticSampleButton } from "@/components/create-synthetic-sample-button"
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
  title: "Dashboard",
  description: "At-a-glance screening progress and quick actions.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const email =
    typeof authData?.claims?.email === "string" ? authData.claims.email : ""
  const firstName = email.split("@")[0] ?? "there"

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
      .limit(4),
    supabase.from("candidates").select("analysis_status"),
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

  const statusCounts = allCandidates.reduce(
    (acc, c) => {
      const s = c.analysis_status as string
      if (s === "completed") acc.completed++
      else if (s === "ready") acc.ready++
      else if (s === "failed") acc.failed++
      else acc.pending++
      return acc
    },
    { completed: 0, ready: 0, pending: 0, failed: 0 }
  )

  const analysisProgressData = [
    {
      label: "Pending",
      completed: 0,
      ready: 0,
      pending: statusCounts.pending,
      failed: 0,
    },
    {
      label: "Ready",
      completed: 0,
      ready: statusCounts.ready,
      pending: statusCounts.pending,
      failed: 0,
    },
    {
      label: "Analyzed",
      completed: statusCounts.completed,
      ready: statusCounts.ready,
      pending: statusCounts.pending,
      failed: statusCounts.failed,
    },
  ]

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
  const completionRate =
    totalCandidates > 0 ? Math.round((reportsReady / totalCandidates) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            Overview
          </p>
          <h1 className="editorial-display mt-2 text-4xl leading-none font-normal tracking-[-0.04em] text-foreground">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s your recruiting activity at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <CreateSyntheticSampleButton />
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border/50"
          >
            <Link href="/dashboard/candidates">
              <IconUsers className="mr-1.5 size-3.5" />
              All candidates
            </Link>
          </Button>
          <CreateJobDialog />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconBriefcase className="size-4" />}
          accent="text-[var(--palette-orchid-ink)] bg-[var(--palette-lavender)]"
          label="Open Roles"
          value={totalJobs}
          sub="Active job criteria"
        />
        <StatCard
          icon={<IconUsers className="size-4" />}
          accent="text-[var(--palette-sky-ink)] bg-[var(--palette-sky)]"
          label="Candidates"
          value={totalCandidates}
          sub="Across all roles"
        />
        <StatCard
          icon={<IconClock className="size-4" />}
          accent="text-[var(--palette-amber-ink)] bg-[var(--palette-peach)]/55"
          label="In Progress"
          value={awaitingAnalysis}
          sub="Awaiting extraction or analysis"
          valueClass="text-[var(--palette-amber-ink)]"
        />
        <StatCard
          icon={<IconCircleCheck className="size-4" />}
          accent="text-[var(--palette-green)] bg-[var(--palette-aquamarine)]/55"
          label="Reports Ready"
          value={reportsReady}
          sub={`${completionRate}% completion rate`}
          valueClass="text-[var(--palette-green)]"
        />
      </div>

      {(hasChartData || hasScoreData) && (
        <div
          className={`grid gap-4 ${hasChartData && hasScoreData ? "lg:grid-cols-2" : "grid-cols-1"}`}
        >
          {hasChartData && (
            <Card className="border-border/40">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconTrendingUp className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Analysis progress
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Current screening states across all roles
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-3">
                <AnalysisProgressChart data={analysisProgressData} />
              </CardContent>
            </Card>
          )}
          {hasScoreData && (
            <Card className="border-border/40">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconChartBar className="size-3.5" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Score Distribution
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Fit scores across analyzed candidates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-3">
                <ScoreDistributionChart data={scoreBuckets} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        {/* Recent roles */}
        <Card className="border-border/40">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Recent Roles
                </CardTitle>
                <CardDescription className="text-xs">
                  Your latest job criteria
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {totalJobs} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentJobs.length > 0 ? (
              <>
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="group flex items-center gap-3 border-b border-border/30 px-5 py-3.5 transition-colors last:border-0 hover:bg-muted/15"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <IconBriefcase className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                        {job.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.must_have_skills.length > 0
                          ? job.must_have_skills.slice(0, 3).join(" · ")
                          : "No must-have skills"}
                      </p>
                    </div>
                    <IconArrowRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted/50">
                  <IconBriefcase className="size-5 text-muted-foreground" />
                </span>
                <p className="text-sm font-semibold">No roles yet</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Create your first role to start screening candidates.
                </p>
                <div className="mt-4">
                  <CreateJobDialog
                    trigger={
                      <Button size="sm">
                        <IconPlus className="mr-1.5 size-3.5" />
                        Create role
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="h-fit border-border/40">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold">
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              {
                n: 1,
                title: "Create a Role",
                desc: "Define requirements and must-have skills.",
              },
              {
                n: 2,
                title: "Add Candidates",
                desc: "Upload a resume and proposal; portfolio is optional.",
              },
              {
                n: 3,
                title: "Extract Resume",
                desc: "Parse PDF text for evidence analysis.",
              },
              {
                n: 4,
                title: "Run Analysis",
                desc: "Get a 100-point evidence-backed report.",
              },
            ].map((step, i, arr) => (
              <div key={step.n}>
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-2 ring-primary/10">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {i < arr.length - 1 && <Separator className="bg-border/30" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  accent,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode
  accent: string
  label: string
  value: number
  sub: string
  valueClass?: string
}) {
  return (
    <Card className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(176,116,206,0.12),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
          <span
            className={`flex size-8 items-center justify-center rounded-lg ${accent}`}
          >
            {icon}
          </span>
        </div>
        <p
          className={`mt-3 font-mono text-3xl font-bold tracking-tight ${valueClass ?? "text-foreground"}`}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
