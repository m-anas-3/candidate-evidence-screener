"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconCircleCheck,
  IconFileText,
  IconLoader2,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  useCandidateStatus,
  useInvalidateCandidateStatus,
} from "@/lib/query/candidate-status"
import type { Database } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

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
  const [message, setMessage] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  // Seeded from the server-rendered status — no loading flash.
  // Polls while status is "extracting" and stops on terminal states.
  const { data } = useCandidateStatus(candidateId, initialStatus)
  const status = data.analysis_status

  const isReady =
    status === "ready" || status === "processing" || status === "completed"
  const isExtracting = status === "extracting" || submitting

  // When extraction completes, refresh the page so the resume text appears
  if (isReady && (initialStatus === "extracting" || submitting)) {
    router.refresh()
  }

  async function extractResume() {
    setSubmitting(true)
    setMessage(undefined)

    try {
      const response = await fetch(
        `/api/candidates/${candidateId}/extract-resume`,
        { method: "POST" }
      )
      const result = (await response.json()) as ExtractionResponse

      if (!response.ok || !result.ok) {
        setMessage(result.ok ? "Resume extraction failed." : result.error)
        await invalidate(candidateId)
        router.refresh()
        return
      }

      setMessage(`Extracted ${result.characterCount.toLocaleString()} characters.`)
      await invalidate(candidateId)
      router.refresh()
    } catch {
      setMessage("Resume extraction could not be started. Try again.")
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
            className="size-4 shrink-0 text-emerald-400"
          />
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Resume text ready
            </p>
            <p className="text-xs text-emerald-400/80">
              Evidence is prepared for analysis.
            </p>
          </div>
        </div>
        {message && (
          <p className="text-xs leading-5 text-muted-foreground" role="status">
            {message}
          </p>
        )}
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

      {message && (
        <p className="text-xs leading-5 text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
