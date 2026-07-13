import type { Metadata } from "next"

import { signUp } from "@/app/(auth)/actions"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = { title: "Create account" }

export default function SignUpPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
          Recruiter workspace
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="text-[13px] leading-6 text-muted-foreground">
          Your workspace isolates jobs, candidates, and private resumes from
          other recruiters.
        </p>
      </div>
      <AuthForm action={signUp} mode="sign-up" />
    </div>
  )
}
