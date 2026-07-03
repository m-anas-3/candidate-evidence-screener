"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2, IconRefresh, IconSparkles } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/supabase/database.types"

type Status = Database["public"]["Enums"]["candidate_analysis_status"]
type Result =
  | { candidateId: string; ok: true; status: "completed" }
  | { error: string; ok: false; reference?: string }

export function CandidateAnalysisControl({
  candidateId,
  status,
}: {
  candidateId: string
  status: Status
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string>()
  const [pending, setPending] = useState(false)
  const processing = status === "processing" || pending

  useEffect(() => {
    if (status !== "processing") return
    const interval = window.setInterval(() => router.refresh(), 3_000)
    return () => window.clearInterval(interval)
  }, [router, status])

  async function analyze() {
    setPending(true)
    setMessage(undefined)
    try {
      const response = await fetch(`/api/candidates/${candidateId}/analyze`, {
        method: "POST",
      })
      const result = (await response.json()) as Result
      if (!response.ok || !result.ok) {
        const reference =
          !result.ok && result.reference
            ? ` Reference: ${result.reference}`
            : ""
        setMessage(
          `${result.ok ? "Analysis failed." : result.error}${reference}`
        )
      } else {
        setMessage("Evidence-backed report completed.")
      }
      router.refresh()
    } catch {
      setMessage("Analysis could not be started. Try again.")
    } finally {
      setPending(false)
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
      {processing ? (
        <p className="text-xs text-muted-foreground" role="status">
          Reviewing all four evidence sources. Keep this page open.
        </p>
      ) : null}
      {message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
