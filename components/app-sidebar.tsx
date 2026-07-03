"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBriefcase,
  IconLayoutDashboard,
  IconLogout,
  IconShieldCheck,
  IconUserScan,
} from "@tabler/icons-react"

import { signOut } from "@/app/(app)/dashboard/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    icon: IconLayoutDashboard,
    label: "Dashboard",
    isActive: (p: string) => p === "/dashboard",
  },
  {
    href: "/dashboard/jobs",
    icon: IconBriefcase,
    label: "Open Roles",
    isActive: (p: string) => p.startsWith("/dashboard/jobs"),
  },
  {
    href: "/dashboard/candidates",
    icon: IconUserScan,
    label: "Candidates",
    isActive: (p: string) =>
      p.startsWith("/dashboard/candidates") && !p.includes("/jobs/"),
  },
] as const

export function AppSidebar({ email }: { email?: string }) {
  const pathname = usePathname()
  const initial = email ? email.slice(0, 2).toUpperCase() : "RC"

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r border-sidebar-border bg-sidebar"
    >
      {/* ── Logo ── */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 transition-all hover:bg-primary/20">
            <IconShieldCheck className="size-4 text-primary" />
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
              Evidence Screener
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.10em] text-primary/80">
              Recruiter HQ
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                const active = item.isActive(pathname)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "relative h-9 rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-primary/12 text-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-primary" : "text-sidebar-foreground/50"
                          )}
                        />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      {email && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-7 rounded-lg ring-1 ring-primary/15 shrink-0">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-[11px] font-semibold text-sidebar-foreground">
                {email}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40">Recruiter account</p>
            </div>
            <form action={signOut} className="group-data-[collapsible=icon]:hidden shrink-0">
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                title="Sign out"
                className="size-7 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <IconLogout className="size-3.5" />
              </Button>
            </form>
          </div>
          {/* Collapsed sign-out */}
          <div className="mt-2 hidden group-data-[collapsible=icon]:flex justify-center">
            <form action={signOut}>
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                title="Sign out"
                className="size-7 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10"
              >
                <IconLogout className="size-3.5" />
              </Button>
            </form>
          </div>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  )
}
