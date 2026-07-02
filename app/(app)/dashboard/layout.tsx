import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
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

  return <DashboardShell email={email}>{children}</DashboardShell>
}
