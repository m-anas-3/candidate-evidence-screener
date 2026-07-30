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
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            <span className="inline-block h-px w-4 rounded-full bg-primary/50" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="editorial-display text-4xl leading-none font-normal tracking-[-0.04em] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
