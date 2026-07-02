"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconFileText } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/supabase/database.types"

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
  const extractionComplete =
    status === "ready" || status === "processing" || status === "completed"

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

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        disabled={pending || extractionComplete}
        onClick={extractResume}
        type="button"
        variant={extractionComplete ? "outline" : "default"}
      >
        <IconFileText aria-hidden="true" />
        {pending
          ? "Extracting text…"
          : extractionComplete
            ? "Resume text ready"
            : status === "failed" || status === "extracting"
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
