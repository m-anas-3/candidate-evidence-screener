"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconBrain,
  IconFileText,
  IconRefresh,
  IconReportAnalytics,
  IconSparkles,
  IconWorldSearch,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  useCandidateStatus,
  useInvalidateCandidateStatus,
} from "@/lib/query/candidate-status"
import type { Database } from "@/lib/supabase/database.types"

type Status = Database["public"]["Enums"]["candidate_analysis_status"]

type Result =
  | { candidateId: string; ok: true; status: "completed" }
  | { error: string; ok: false; reference?: string }

const analysisSteps = [
  { icon: IconFileText, label: "Reading candidate evidence" },
  { icon: IconWorldSearch, label: "Reviewing submitted evidence" },
  { icon: IconBrain, label: "Matching skills to the role" },
  { icon: IconReportAnalytics, label: "Building the screening report" },
] as const

function AgentWorkingState() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((step) => (step + 1) % analysisSteps.length)
    }, 2200)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent motion-safe:animate-pulse"
      />
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <p className="text-xs font-medium text-foreground" role="status">
          Screening agent is working
          <span className="sr-only">: {analysisSteps[activeStep].label}</span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {analysisSteps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === activeStep
          return (
            <div
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-md px-1 py-2 transition-all duration-500 ${
                isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_18px_-8px_var(--primary)]"
                  : "text-muted-foreground"
              }`}
              key={step.label}
            >
              <Icon
                className={`size-4 transition-transform duration-500 ${isActive ? "scale-110 motion-safe:animate-pulse" : ""}`}
              />
              <span className="line-clamp-2 text-center text-[9px] leading-tight">
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent motion-safe:animate-[agent-scan_1.8s_ease-in-out_infinite]"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export function CandidateAnalysisControl({
  candidateId,
  status: initialStatus,
}: {
  candidateId: string
  status: Status
}) {
  const router = useRouter()
  const invalidate = useInvalidateCandidateStatus()
  const [submitting, setSubmitting] = useState(false)

  // useCandidateStatus polls every 3 s while status is "processing" and
  // stops automatically once a terminal status is reached. It is seeded
  // with the server-rendered initialStatus so there is no loading flash.
  const { data } = useCandidateStatus(candidateId, initialStatus)
  const status = data.analysis_status

  // Refresh outside render when polling observes completion so the Server
  // Component re-runs and the finished report appears.
  useEffect(() => {
    if (status === "completed" && initialStatus === "processing") {
      router.refresh()
    }
  }, [initialStatus, router, status])

  const processing = status === "processing" || submitting

  async function analyze() {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/candidates/${candidateId}/analyze`, {
        method: "POST",
      })
      const result = (await response.json()) as Result

      if (!response.ok || !result.ok) {
        const ref =
          !result.ok && result.reference ? ` Ref: ${result.reference}` : ""
        toast.error(!result.ok ? result.error : "Analysis failed.", {
          description: ref ? ref.trim() : undefined,
        })
        // Invalidate so the status refreshes immediately after an error
        await invalidate(candidateId)
        router.refresh()
      } else {
        toast.success("Candidate analysis complete", {
          description: "The evidence-backed report is ready to review.",
        })
        await invalidate(candidateId)
        router.refresh()
      }
    } catch {
      toast.error("Analysis could not be started", {
        description: "Check your connection and try again.",
      })
      await invalidate(candidateId)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "completed") return null

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={processing}
        onClick={analyze}
        type="button"
      >
        {processing ? (
          <IconSparkles className="motion-safe:animate-pulse" />
        ) : status === "failed" ? (
          <IconRefresh />
        ) : (
          <IconSparkles />
        )}
        {processing
          ? "Analyzing evidence…"
          : status === "failed"
            ? "Retry fit analysis"
            : "Run fit analysis"}
      </Button>

      {processing && <AgentWorkingState />}
    </div>
  )
}
