import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { IconShieldCheck } from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/server"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard/jobs")
  }

  return (
    <main className="min-h-svh bg-background lg:grid lg:grid-cols-[1fr_minmax(28rem,0.72fr)]">
      {/* ── Left — branding panel ── */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-[oklch(0.095_0.007_252)] p-12 xl:p-16">
        {/* Gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/10 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-20 size-[400px] rounded-full bg-primary/8 blur-[100px]"
        />

        {/* Grid lines decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top — logo */}
        <div className="relative flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
            <IconShieldCheck className="size-4.5 text-primary" />
          </span>
          <div>
            <span className="block text-sm font-semibold tracking-tight text-white">
              Evidence Screener
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
              Recruiter Platform
            </span>
          </div>
        </div>

        {/* Middle — headline */}
        <div className="relative max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary">
              Evidence-backed hiring decisions
            </span>
          </div>
          <h1 className="text-[2.6rem] font-semibold leading-[1.15] tracking-[-0.03em] text-white xl:text-5xl">
            Review candidates against the work that{" "}
            <span className="text-primary">actually matters.</span>
          </h1>
          <p className="text-base leading-7 text-white/50">
            Compare job requirements against resume, proposal, and portfolio
            evidence. Every result is advisory and requires human review.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "Resume extraction",
              "Proposal analysis",
              "Portfolio inspection",
              "Grounded AI chat",
            ].map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-white/60"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — trust line */}
        <p className="relative text-xs text-white/25 tracking-wide">
          Private resumes · Evidence-backed reports · Human review required
        </p>
      </section>

      {/* ── Right — form panel ── */}
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
