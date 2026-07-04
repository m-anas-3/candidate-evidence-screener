import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconUserPlus } from "@tabler/icons-react"

import { CandidateForm } from "@/components/candidate-form"
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
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Add Candidate" }

export default async function NewCandidatePage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  const [{ data: authData }, { data: job, error: jobError }] =
    await Promise.all([
      supabase.auth.getClaims(),
      supabase
        .from("jobs")
        .select("id, title, must_have_skills")
        .eq("id", jobId)
        .maybeSingle(),
    ])

  const userId = authData?.claims?.sub

  if (jobError) {
    throw new Error("The role could not be loaded.")
  }

  if (!job || !userId) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
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
              <BreadcrumbPage>Add Candidate</BreadcrumbPage>
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
            Back to role
          </Link>
        </Button>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Add candidate to role
        </h1>
        <p className="text-sm text-muted-foreground">
          Provide candidate details and resume to screen them against the role
          criteria.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-start">
        {/* Left column: Intake Form */}
        <Card className="border-border/50 shadow-md">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconUserPlus className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">
                  Candidate Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload evidence and paste proposal to analyze fit.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CandidateForm jobId={job.id} userId={userId} />
          </CardContent>
        </Card>

        {/* Right column: Guided checklist / Context */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-muted/10 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Target Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {job.title}
                </h4>
                <p className="text-2xs mt-0.5 text-muted-foreground">
                  Job criteria identifier: {job.id}
                </p>
              </div>
              {job.must_have_skills.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-2xs font-semibold text-muted-foreground">
                    Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.must_have_skills.slice(0, 5).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-2xs font-normal"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {job.must_have_skills.length > 5 && (
                      <Badge variant="outline" className="text-2xs font-normal">
                        +{job.must_have_skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold">
                How this works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-2.5">
                <span className="text-2xs mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  1
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Enter the candidate&apos;s name and paste their original
                  proposal.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-2xs mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  2
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Provide a public portfolio URL and upload their PDF resume.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-2xs mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  3
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Submit to upload. You&apos;ll be redirected to extract the
                  resume text and run fit analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
