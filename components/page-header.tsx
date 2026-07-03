import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode
  className?: string
  description?: string
  eyebrow?: string
  title: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary flex items-center gap-2">
            <span className="h-px w-4 bg-primary/50 rounded-full inline-block" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
