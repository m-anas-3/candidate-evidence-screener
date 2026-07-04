"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconFileText,
  IconLoader2,
  IconRefresh,
  IconSparkles,
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

function AgentWorkingState() {
  return (
    <div
      aria-live="polite"
      className="w-full min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm sm:max-w-sm sm:min-w-80"
      role="status"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconLoader2
            aria-hidden="true"
            className="size-4 motion-safe:animate-spin"
          />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-foreground">
            Analyzing candidate
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Comparing the submitted evidence with the role requirements.
          </p>
        </div>
      </div>

      <div className="h-1 overflow-hidden bg-muted/60" aria-hidden="true">
        <div className="h-full w-full origin-left bg-primary/70 motion-safe:animate-pulse" />
      </div>

      <div className="flex items-center gap-2 border-t border-border/40 bg-muted/15 px-4 py-2.5 text-[11px] text-muted-foreground">
        <IconFileText aria-hidden="true" className="size-3.5 shrink-0" />
        <span>Resume, proposal, and role criteria are being reviewed</span>
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

  if (processing) return <AgentWorkingState />

  return (
    <Button
      className="w-full rounded-lg px-4 shadow-sm sm:w-auto"
      onClick={analyze}
      type="button"
    >
      {status === "failed" ? <IconRefresh /> : <IconSparkles />}
      {status === "failed" ? "Retry fit analysis" : "Run fit analysis"}
    </Button>
  )
}
