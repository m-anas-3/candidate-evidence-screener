import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconBriefcase,
  IconShieldCheck,
  IconUserScan,
} from "@tabler/icons-react"

import { signOut } from "@/app/(app)/dashboard/actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/login")
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Authenticated recruiter"

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="flex min-w-0 items-center gap-3"
            href="/dashboard/jobs"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                Candidate Evidence Screener
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Human-reviewed hiring evidence
              </span>
            </span>
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-56 truncate text-xs text-muted-foreground sm:block">
              {email}
            </span>
            <form action={signOut}>
              <Button size="sm" type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)] lg:px-8">
        <nav aria-label="Primary" className="flex gap-2 md:flex-col">
          <NavLink href="/dashboard/jobs" icon={<IconBriefcase />}>
            Jobs
          </NavLink>
          <NavLink href="/dashboard/candidates" icon={<IconUserScan />}>
            Candidates
          </NavLink>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

function NavLink({
  children,
  href,
  icon,
}: {
  children: ReactNode
  href: string
  icon: ReactNode
}) {
  return (
    <Link
      className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"
      href={href}
    >
      {icon}
      {children}
    </Link>
  )
}
