import type { Metadata } from "next"
import Link from "next/link"
import {
  IconBriefcase,
  IconCircleCheck,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react"

import { CreateJobDialog } from "@/components/create-job-dialog"
import { DeleteRecordButton } from "@/components/delete-record-button"
import { LocalDate } from "@/components/local-date"
import { RouteToast } from "@/components/route-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Open Roles" }

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      must_have_skills,
      created_at,
      candidates (
        id,
        analysis_status,
        screening_reports ( status )
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) throw new Error("Jobs could not be loaded.")

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {notice === "role-deleted" && (
        <RouteToast id="role-deleted" message="Role deleted." />
      )}
      {notice === "role-unavailable" && (
        <RouteToast
          id="role-unavailable"
          message="That role is no longer available."
          variant="error"
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            <span className="inline-block h-px w-4 rounded-full bg-primary/50" />
            Recruiting Workspace
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Open Roles
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {jobs.length > 0
              ? `${jobs.length} role${jobs.length === 1 ? "" : "s"} — click a row to manage candidates.`
              : "Create a role to start screening candidates."}
          </p>
        </div>
        <CreateJobDialog />
      </div>

      {jobs.length > 0 ? (
        <Card className="overflow-hidden border-border/40">
          <Table>
            <TableHeader className="border-b border-border/40 bg-muted/20">
              <TableRow>
                <TableHead className="w-[40%] pl-5 text-xs font-semibold">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Must-have Skills
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Candidates
                </TableHead>
                <TableHead className="text-xs font-semibold">Reports</TableHead>
                <TableHead className="text-xs font-semibold">Created</TableHead>
                <TableHead className="w-[8%] pr-5 text-right text-xs font-semibold" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const candidateCount = job.candidates?.length ?? 0
                const reportCount =
                  job.candidates?.filter((c) => {
                    const r = c.screening_reports
                    const report = Array.isArray(r) ? r[0] : r
                    return report?.status === "completed"
                  }).length ?? 0

                return (
                  <TableRow
                    key={job.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/15"
                  >
                    {/* Role name */}
                    <TableCell className="py-4 pl-5">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15">
                          <IconBriefcase className="size-3.5" />
                        </span>
                        <span className="text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
                          {job.title}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Skills */}
                    <TableCell className="py-4">
                      {job.must_have_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {job.must_have_skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-2 py-0 text-[10px] font-normal"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.must_have_skills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              +{job.must_have_skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          None
                        </span>
                      )}
                    </TableCell>

                    {/* Candidate count */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconUsers className="size-3.5" />
                        <span className="font-medium text-foreground">
                          {candidateCount}
                        </span>
                      </div>
                    </TableCell>

                    {/* Reports ready */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <IconCircleCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          {reportCount}
                        </span>
                        {candidateCount > 0 && (
                          <span className="text-muted-foreground">
                            / {candidateCount}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-4 text-xs text-muted-foreground">
                      <LocalDate value={job.created_at} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-4 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-border/50 text-xs transition-all hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                        >
                          <Link href={`/dashboard/jobs/${job.id}`}>Open</Link>
                        </Button>
                        <DeleteRecordButton
                          id={job.id}
                          name={job.title}
                          recordType="role"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-border/40">
          <CardContent className="flex min-h-72 flex-col items-center justify-center py-14 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/30">
              <IconBriefcase className="size-6 text-muted-foreground" />
            </span>
            <h2 className="text-base font-semibold">No roles yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Define a role with requirements and must-have skills. Candidates
              added to it will be evaluated against those criteria.
            </p>
            <div className="mt-6">
              <CreateJobDialog
                trigger={
                  <Button>
                    <IconPlus className="mr-1.5 size-4" />
                    Create first role
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
