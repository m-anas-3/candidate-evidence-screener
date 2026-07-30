"use client"

import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function DashboardShell({
  children,
  email,
}: {
  children: ReactNode
  email: string
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <a
          href="#dashboard-content"
          className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0 focus:outline-none"
        >
          Skip to dashboard content
        </a>
        <AppSidebar email={email} />
        <SidebarInset className="bg-background">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border/70 bg-background/92 px-4 backdrop-blur-md sm:px-5">
            <SidebarTrigger className="-ml-0.5 size-7 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mx-1 h-3.5 bg-border/60"
            />
            {/* Slot for per-page breadcrumbs — injected via children layout */}
            <div className="flex flex-1 items-center justify-end">
              <span className="hidden text-xs text-muted-foreground sm:block">
                {email}
              </span>
            </div>
          </header>

          <main
            id="dashboard-content"
            className="flex flex-1 flex-col gap-6 bg-background p-5 sm:p-7"
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
