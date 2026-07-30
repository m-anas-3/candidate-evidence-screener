import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { IconShieldCheck } from "@tabler/icons-react"

import { AuthCarousel } from "@/components/auth-carousel"
import { createClient } from "@/lib/supabase/server"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-svh bg-background lg:grid lg:grid-cols-[1fr_minmax(28rem,0.72fr)]">
      <section className="relative hidden overflow-hidden border-r bg-[var(--palette-lavender)] p-12 lg:flex lg:flex-col xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[8%] -left-10 h-20 w-52 bg-[var(--palette-sky)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[17%] left-0 h-28 w-24 bg-[var(--palette-aquamarine)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[12%] -right-10 h-28 w-44 bg-[var(--palette-peach)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 bottom-[12%] h-14 w-52 bg-white/35"
        />

        <div className="relative flex shrink-0 items-center gap-3">
          <span className="flex size-9 items-center justify-center border border-foreground bg-foreground text-background">
            <IconShieldCheck className="size-4.5" />
          </span>
          <div>
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              Evidence Screener
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
              Candidate evidence review
            </span>
          </div>
        </div>

        <div className="relative flex-1 py-12">
          <AuthCarousel />
        </div>

        <p className="relative shrink-0 border-t border-foreground/15 pt-5 text-xs tracking-wide text-foreground/58">
          Private resumes · Evidence-backed reports · Human review required
        </p>
      </section>

      <section className="relative flex min-h-svh flex-col items-center justify-center bg-[var(--palette-paper)] p-6 sm:p-10 lg:min-h-0">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-24 w-24 bg-[var(--palette-peach)]/45 lg:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-20 w-32 bg-[var(--palette-sky)]/55 lg:hidden"
        />
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex size-8 items-center justify-center border border-foreground bg-foreground text-background">
            <IconShieldCheck className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Evidence Screener
          </span>
        </div>
        <div className="relative w-full max-w-md border bg-card p-6 shadow-[12px_14px_0_rgba(176,116,206,0.14)] sm:p-8">
          {children}
        </div>
      </section>
    </main>
  )
}
