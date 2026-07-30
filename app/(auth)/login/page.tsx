import type { Metadata } from "next"

import { signIn } from "@/app/(auth)/actions"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = { title: "Sign in" }

const notices: Record<string, string> = {
  "signed-out": "You have been signed out.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
          Welcome back
        </p>
        <h2 className="editorial-display text-4xl leading-none font-normal tracking-[-0.04em] text-foreground">
          Sign in
        </h2>
        <p className="text-[13px] leading-6 text-muted-foreground">
          Access your private jobs, candidates, and screening reports.
        </p>
      </div>
      <AuthForm
        action={signIn}
        mode="sign-in"
        notice={notice ? notices[notice] : undefined}
      />
    </div>
  )
}
