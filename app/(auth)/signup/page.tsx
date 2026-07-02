import type { Metadata } from "next"

import { signUp } from "@/app/(auth)/actions"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = { title: "Create account" }

export default function SignUpPage() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-primary">Recruiter workspace</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Your account isolates jobs, candidate evidence, and private resumes
          from other recruiters. You will enter the workspace immediately.
        </p>
      </div>
      <AuthForm action={signUp} mode="sign-up" />
    </div>
  )
}
