"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconCircleCheck, IconFileText, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  useCandidateStatus,
  useInvalidateCandidateStatus,
} from "@/lib/query/candidate-status"
import type { Database } from "@/lib/supabase/database.types"

type AnalysisStatus = Database["public"]["Enums"]["candidate_analysis_status"]

type ExtractionResponse =
  | { characterCount: number; ok: true; status: "ready" }
  | { error: string; ok: false }

export function ResumeExtractionControl({
  candidateId,
  status: initialStatus,
}: {
  candidateId: string
  status: AnalysisStatus
}) {
  const router = useRouter()
  const invalidate = useInvalidateCandidateStatus()
  const [submitting, setSubmitting] = useState(false)

  // Seeded from the server-rendered status — no loading flash.
  // Polls while status is "extracting" and stops on terminal states.
  const { data } = useCandidateStatus(candidateId, initialStatus)
  const status = data.analysis_status

  const isReady =
    status === "ready" || status === "processing" || status === "completed"
  const isExtracting = status === "extracting" || submitting

  // When extraction completes, refresh the page so the resume text appears
  useEffect(() => {
    if (isReady && initialStatus === "extracting") router.refresh()
  }, [initialStatus, isReady, router])

  async function extractResume() {
    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/candidates/${candidateId}/extract-resume`,
        { method: "POST" }
      )
      const result = (await response.json()) as ExtractionResponse

      if (!response.ok || !result.ok) {
        toast.error(result.ok ? "Resume extraction failed." : result.error)
        await invalidate(candidateId)
        router.refresh()
        return
      }

      toast.success("Resume is ready", {
        description: `${result.characterCount.toLocaleString()} characters were prepared for analysis.`,
      })
      await invalidate(candidateId)
      router.refresh()
    } catch {
      toast.error("Resume extraction could not be started", {
        description: "Check your connection and try again.",
      })
      await invalidate(candidateId)
    } finally {
      setSubmitting(false)
    }
  }

  if (isReady) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
          <IconCircleCheck
            aria-hidden
            className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400"
          />
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Resume text ready
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Evidence is prepared for analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={isExtracting}
        onClick={extractResume}
        size="lg"
        type="button"
      >
        {isExtracting ? (
          <IconLoader2 aria-hidden className="animate-spin" />
        ) : (
          <IconFileText aria-hidden />
        )}
        {isExtracting
          ? "Extracting text…"
          : status === "failed"
            ? "Retry extraction"
            : "Extract resume text"}
      </Button>
    </div>
  )
}
