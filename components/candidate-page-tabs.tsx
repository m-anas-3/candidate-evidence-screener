"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import {
  IconFileText,
  IconChartBar,
  IconMessageCircle,
  IconArrowUpRight,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Tab = "evidence" | "report" | "chat"

const tabs: { id: Tab; label: string; icon: React.ElementType; requiresReport?: boolean }[] = [
  { id: "evidence", label: "Evidence", icon: IconFileText },
  { id: "report",   label: "Fit Report", icon: IconChartBar, requiresReport: true },
  { id: "chat",     label: "Ask AI",     icon: IconMessageCircle, requiresReport: true },
]

export function CandidatePageTabs({
  hasReport,
  candidateId,
  jobId,
  evidencePanel,
  reportPanel,
  chatPanel,
}: {
  hasReport: boolean
  candidateId: string
  jobId: string
  evidencePanel: ReactNode
  reportPanel: ReactNode
  chatPanel: ReactNode
}) {
  const [active, setActive] = useState<Tab>(hasReport ? "report" : "evidence")

  return (
    <div className="space-y-0">
      {/* ── Tab navigation bar ───────────────────────────────────────── */}
      <div className="relative flex items-end gap-0 border-b border-border/50">
        {tabs.map((tab) => {
          const disabled = tab.requiresReport && !hasReport
          const isActive = active === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setActive(tab.id)}
              className={cn(
                "group relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-150 select-none",
                // Active state
                isActive
                  ? "text-foreground"
                  : disabled
                    ? "cursor-not-allowed text-muted-foreground/30"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  isActive ? "text-primary" : disabled ? "text-muted-foreground/25" : "text-muted-foreground/60 group-hover:text-foreground/60"
                )}
              />
              {tab.label}
              {tab.requiresReport && !hasReport && (
                <span className="ml-1 rounded-full bg-muted/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/40">
                  After analysis
                </span>
              )}
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </button>
          )
        })}

        {/* Open full chat link — only visible on chat tab */}
        {active === "chat" && hasReport && (
          <div className="ml-auto flex items-center pr-1 pb-2">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Link href={`/dashboard/jobs/${jobId}/candidates/${candidateId}/chat`}>
                Full page
                <IconArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Panel content ───────────────────────────────────────────── */}
      <div className="pt-6">
        {active === "evidence" && evidencePanel}
        {active === "report"   && reportPanel}
        {active === "chat"     && chatPanel}
      </div>
    </div>
  )
}
