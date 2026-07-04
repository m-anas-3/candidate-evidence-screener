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
      {/* ── Left — branding + carousel ── */}
      <section className="relative hidden overflow-hidden bg-[oklch(0.095_0.007_252)] p-12 lg:flex lg:flex-col xl:p-16">
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 size-[400px] rounded-full bg-primary/8 blur-[100px]"
        />

        {/* Grid lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative flex shrink-0 items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
            <IconShieldCheck className="size-4.5 text-primary" />
          </span>
          <div>
            <span className="block text-sm font-semibold tracking-tight text-white">
              Evidence Screener
            </span>
            <span className="block text-[10px] font-medium tracking-[0.12em] text-primary uppercase">
              Recruiter Platform
            </span>
          </div>
        </div>

        {/* Carousel — fills remaining space */}
        <div className="relative flex-1 py-12">
          <AuthCarousel />
        </div>

        {/* Footer */}
        <p className="relative shrink-0 text-xs tracking-wide text-white/75">
          Private resumes · Evidence-backed reports · Human review required
        </p>
      </section>

      {/* ── Right — form ── */}
      <section className="flex min-h-svh flex-col items-center justify-center bg-background p-6 sm:p-10 lg:min-h-0">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <IconShieldCheck className="size-4 text-primary" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Evidence Screener
          </span>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
