"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconCircleCheck,
  IconFileText,
  IconLoader2,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

type AnalysisStatus = Database["public"]["Enums"]["candidate_analysis_status"]

type ExtractionResponse =
  | { characterCount: number; ok: true; status: "ready" }
  | { error: string; ok: false }

export function ResumeExtractionControl({
  candidateId,
  status,
}: {
  candidateId: string
  status: AnalysisStatus
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string>()
  const [pending, setPending] = useState(false)

  const isReady =
    status === "ready" ||
    status === "processing" ||
    status === "completed"
  const isExtracting = status === "extracting" || pending
  const canExtract = !isReady && !isExtracting

  async function extractResume() {
    setPending(true)
    setMessage(undefined)

    try {
      const response = await fetch(
        `/api/candidates/${candidateId}/extract-resume`,
        { method: "POST" }
      )
      const result = (await response.json()) as ExtractionResponse

      if (!response.ok || !result.ok) {
        setMessage(result.ok ? "Resume extraction failed." : result.error)
        router.refresh()
        return
      }

      setMessage(
        `Extracted ${result.characterCount.toLocaleString()} characters.`
      )
      router.refresh()
    } catch {
      setMessage("Resume extraction could not be started. Try again.")
    } finally {
      setPending(false)
    }
  }

  if (isReady) {
    return (
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5"
          )}
        >
          <IconCircleCheck
            aria-hidden="true"
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
        {message ? (
          <p className="text-xs leading-5 text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={!canExtract && !isExtracting}
        onClick={extractResume}
        size="lg"
        type="button"
        variant="default"
      >
        {isExtracting ? (
          <IconLoader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <IconFileText aria-hidden="true" />
        )}
        {isExtracting
          ? "Extracting text…"
          : status === "failed"
            ? "Retry extraction"
            : "Extract resume text"}
      </Button>
      {message ? (
        <p className="text-xs leading-5 text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
