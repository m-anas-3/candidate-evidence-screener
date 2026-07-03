import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconSparkles } from "@tabler/icons-react"

import { CandidateChat } from "@/components/candidate-chat"
import type { ChatMessage } from "@/components/candidate-chat"
import { AnalysisStatusBadge } from "@/components/analysis-status-badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { screeningReportSchema } from "@/lib/agent/report-schema"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Candidate AI Chat" }

export default async function CandidateChatPage({
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
    { data: reportRaw },
    { data: chatHistory },
  ] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, name, analysis_status")
      .eq("id", candidateId)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("id, title")
      .eq("id", jobId)
      .maybeSingle(),
    supabase
      .from("screening_reports")
      .select("raw_structured_output, status")
      .eq("candidate_id", candidateId)
      .maybeSingle(),
    supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: true })
      .limit(50),
  ])

  if (candidateError || !candidate || jobError || !job) {
    notFound()
  }

  const reportResult = screeningReportSchema.safeParse(
    reportRaw?.status === "completed" ? reportRaw.raw_structured_output : null
  )
  const hasReport = reportResult.success

  const initialMessages: ChatMessage[] = (chatHistory ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }))
  const candidateHref = `/dashboard/jobs/${job.id}/candidates/${candidate.id}${from === "/dashboard/candidates" ? `?from=${encodeURIComponent("/dashboard/candidates")}` : ""}`

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col gap-0">
      {/* Header bar */}
      <div className="flex shrink-0 flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
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
                <BreadcrumbLink asChild>
                  <Link
                    href={candidateHref}
                  >
                    {candidate.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <IconSparkles className="size-4.5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {candidate.name}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{job.title}</p>
                <AnalysisStatusBadge status={candidate.analysis_status} />
              </div>
            </div>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="self-start border-border/50 sm:self-auto"
        >
          <Link
            href={candidateHref}
          >
            <IconArrowLeft className="mr-1.5 size-3.5" />
            Back to candidate
          </Link>
        </Button>
      </div>

      {/* Chat — fills remaining height */}
      <div className="min-h-0 flex-1">
        <CandidateChat
          candidateId={candidate.id}
          hasReport={hasReport}
          initialMessages={initialMessages}
          fullPage
        />
      </div>
    </div>
  )
}
