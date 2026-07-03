"use client"

import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function OutreachMessageEditor({ message }: { message: string }) {
  const [value, setValue] = useState(message)
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2_000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="space-y-3">
      <Textarea
        aria-label="Editable outreach or rejection message"
        className="min-h-48 font-mono text-xs"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Edits remain local until copied.
        </p>
        <Button onClick={copy} size="sm" type="button" variant="outline">
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? "Copied" : "Copy message"}
        </Button>
      </div>
    </div>
  )
}
