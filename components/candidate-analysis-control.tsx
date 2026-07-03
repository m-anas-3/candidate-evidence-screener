"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2, IconRefresh, IconSparkles } from "@tabler/icons-react"

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

export function CandidateAnalysisControl({
  candidateId,
  status: initialStatus,
}: {
  candidateId: string
  status: Status
}) {
  const router = useRouter()
  const invalidate = useInvalidateCandidateStatus()
  const [message, setMessage] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  // useCandidateStatus polls every 3 s while status is "processing" and
  // stops automatically once a terminal status is reached. It is seeded
  // with the server-rendered initialStatus so there is no loading flash.
  const { data } = useCandidateStatus(candidateId, initialStatus)
  const status = data.analysis_status

  // When status transitions to completed, refresh the page so the Server
  // Component re-runs and the report appears.
  const wasProcessing =
    initialStatus === "processing" || submitting
  if (status === "completed" && wasProcessing) {
    router.refresh()
  }

  const processing = status === "processing" || submitting

  async function analyze() {
    setSubmitting(true)
    setMessage(undefined)

    try {
      const response = await fetch(`/api/candidates/${candidateId}/analyze`, {
        method: "POST",
      })
      const result = (await response.json()) as Result

      if (!response.ok || !result.ok) {
        const ref =
          !result.ok && result.reference ? ` Ref: ${result.reference}` : ""
        setMessage(`${!result.ok ? result.error : "Analysis failed."}${ref}`)
        // Invalidate so the status refreshes immediately after an error
        await invalidate(candidateId)
        router.refresh()
      } else {
        setMessage("Evidence-backed report completed.")
        await invalidate(candidateId)
        router.refresh()
      }
    } catch {
      setMessage("Analysis could not be started. Try again.")
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
          <IconLoader2 className="animate-spin" />
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

      {processing && (
        <p className="text-xs text-muted-foreground" role="status">
          Reviewing all four evidence sources. Keep this page open.
        </p>
      )}

      {message && (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
