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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    href: "/dashboard",
    icon: IconLayoutDashboard,
    label: "Dashboard",
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/jobs",
    icon: IconBriefcase,
    label: "Your open roles",
    isActive: (pathname: string) => pathname.startsWith("/dashboard/jobs"),
  },
  {
    href: "/dashboard/candidates",
    icon: IconUserScan,
    label: "All candidates",
    isActive: (pathname: string) =>
      pathname.startsWith("/dashboard/candidates") && !pathname.includes("/jobs/"),
  },
] as const

interface AppSidebarProps {
  email?: string
}

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname()
  const initial = email ? email.substring(0, 2).toUpperCase() : "RC"

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/50">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <Link
          className="flex items-center gap-2.5 px-2 py-1 group-data-[collapsible=icon]:justify-center"
          href="/dashboard"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary/20">
            <IconShieldCheck aria-hidden="true" className="size-4.5" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-bold tracking-tight text-foreground">
              Evidence Screener
            </span>
            <span className="block truncate text-2xs font-medium text-primary uppercase tracking-wider">
              Recruiter HQ
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu>
              {navItems.map((item) => {
                const active = item.isActive(pathname)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={`relative px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        {/* Active accent bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          aria-hidden="true"
                          className={`size-4.5 transition-colors ${
                            active ? "text-primary" : "text-muted-foreground group-hover/menu-button:text-foreground"
                          }`}
                        />
                        <span className="text-xs group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {email && (
        <SidebarFooter className="border-t border-sidebar-border/50 p-4 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 rounded-lg ring-1 ring-primary/15">
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-xs font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block text-xs font-semibold truncate text-foreground">
                Recruiter Account
              </span>
              <span className="block text-2xs truncate text-muted-foreground">
                {email}
              </span>
            </div>
            <form action={signOut} className="group-data-[collapsible=icon]:hidden">
              <Button
                size="icon-xs"
                variant="ghost"
                type="submit"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <IconLogout className="size-3.5" />
              </Button>
            </form>
          </div>
          {/* Collapsed fallback */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center mt-2">
            <form action={signOut}>
              <Button
                size="icon-xs"
                variant="ghost"
                type="submit"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Sign out"
              >
                <IconLogout className="size-3.5" />
              </Button>
            </form>
          </div>
        </SidebarFooter>
      )}

      <SidebarSeparator />
      <SidebarRail />
    </Sidebar>
  )
}
