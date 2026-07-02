import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconBriefcase,
  IconCircleCheck,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react"

import { CreateJobDialog } from "@/components/create-job-dialog"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Your Open Roles" }

export default async function JobsPage() {
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      must_have_skills,
      created_at,
      candidates (
        id,
        analysis_status,
        screening_reports (
          status
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Jobs could not be loaded.")
  }

  return (
    <section
      aria-labelledby="jobs-heading"
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      <PageHeader
        eyebrow="Recruiting Workspace"
        title="Your open roles"
        description="Establish structured criteria to evaluate and filter candidate portfolios, proposals, and resumes."
        action={<CreateJobDialog />}
      />

      {jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const candidatesCount = job.candidates?.length ?? 0
            const reportsCount =
              job.candidates?.filter((c) => {
                const reports = c.screening_reports
                if (!reports) return false
                const report = Array.isArray(reports) ? reports[0] : reports
                return report?.status === "completed"
              }).length ?? 0

            return (
              <Card
                key={job.id}
                className="group relative flex flex-col justify-between overflow-hidden border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                size="sm"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Link
                  className="flex flex-col h-full justify-between relative"
                  href={`/dashboard/jobs/${job.id}`}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/5">
                        <IconBriefcase className="size-4" />
                      </span>
                      <span className="text-2xs text-muted-foreground font-medium">
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mt-3">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-xs text-muted-foreground/80">
                      {job.must_have_skills.length
                        ? job.must_have_skills.slice(0, 4).join(" · ")
                        : "No must-have skills specified"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 mt-auto space-y-4">
                    {/* Skills badges */}
                    {job.must_have_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.must_have_skills.slice(0, 3).map((skill) => (
                          <Badge
                            className="font-normal text-2xs px-2 py-0"
                            key={skill}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.must_have_skills.length > 3 && (
                          <Badge
                            className="font-normal text-2xs px-1.5 py-0"
                            variant="outline"
                          >
                            +{job.must_have_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats summary */}
                    <div className="flex items-center gap-4 border-t border-border/40 pt-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <IconUsers className="size-3.5" />
                        <span>{candidatesCount} candidates</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <IconCircleCheck className="size-3.5" />
                        <span>{reportsCount} ready</span>
                      </div>
                      <span className="ml-auto flex items-center justify-center size-7 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
                        <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border/40">
          <CardContent className="flex min-h-64 flex-col items-center justify-center py-12 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/30">
              <IconBriefcase
                aria-hidden="true"
                className="size-6 text-muted-foreground"
              />
            </span>
            <h2 className="text-base font-semibold">Create your first role</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground/80 leading-relaxed">
              Define the criteria, description, and must-have skills that candidate portfolios, proposals, and resumes will be evaluated against.
            </p>
            <div className="mt-6">
              <CreateJobDialog
                trigger={
                  <Button className="bg-primary hover:bg-primary/85 font-semibold">
                    <IconPlus className="size-4 mr-1.5" />
                    Create job criteria
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
