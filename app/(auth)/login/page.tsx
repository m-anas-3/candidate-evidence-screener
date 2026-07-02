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
    <div className="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-primary">Welcome back</p>
        <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="text-sm leading-6 text-muted-foreground">
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
