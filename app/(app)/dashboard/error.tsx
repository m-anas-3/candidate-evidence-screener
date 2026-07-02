"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-3xl border border-destructive/30 bg-card p-8">
      <p className="text-sm font-medium text-destructive">Workspace error</p>
      <h1 className="mt-2 text-xl font-semibold">
        We could not load this page.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Check your connection and try again. Your stored data has not been
        changed.
      </p>
      <Button className="mt-6" onClick={reset} type="button">
        Try again
      </Button>
    </div>
  )
}
