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
        <AppSidebar email={email} />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <Separator className="h-4 bg-border/50" orientation="vertical" />
            <div className="flex flex-1 items-center justify-end gap-3">
              <span className="hidden max-w-56 truncate text-xs font-medium text-muted-foreground/80 sm:block">
                Logged in as: <span className="text-foreground">{email}</span>
              </span>
            </div>
          </header>

          <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 bg-background/50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
