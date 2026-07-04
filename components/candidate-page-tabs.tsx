"use client"

import { type ReactNode, useState } from "react"
import {
  IconFileText,
  IconChartBar,
  IconMessageCircle,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type Tab = "evidence" | "report" | "chat"

const tabs: {
  id: Tab
  label: string
  icon: React.ElementType
  requiresReport?: boolean
}[] = [
  { id: "evidence", label: "Evidence", icon: IconFileText },
  {
    id: "report",
    label: "Fit Report",
    icon: IconChartBar,
    requiresReport: true,
  },
  {
    id: "chat",
    label: "Ask AI",
    icon: IconMessageCircle,
    requiresReport: true,
  },
]

export function CandidatePageTabs({
  hasReport,
  evidencePanel,
  reportPanel,
  chatPanel,
}: {
  hasReport: boolean
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
                    ? "cursor-not-allowed text-muted-foreground"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  isActive
                    ? "text-primary"
                    : disabled
                      ? "text-muted-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {tab.label}
              {tab.requiresReport && !hasReport && (
                <span className="ml-1 rounded-full bg-muted/50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                  After analysis
                </span>
              )}
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Panel content ───────────────────────────────────────────── */}
      <div className="pt-6">
        <div hidden={active !== "evidence"}>{evidencePanel}</div>
        <div hidden={active !== "report"}>{reportPanel}</div>
        <div hidden={active !== "chat"}>{chatPanel}</div>
      </div>
    </div>
  )
}
