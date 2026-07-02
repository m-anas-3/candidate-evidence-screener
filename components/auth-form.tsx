"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import type { AuthActionState } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

const initialState: AuthActionState = {}

type AuthFormProps = {
  action: (
    previousState: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>
  mode: "sign-in" | "sign-up"
  notice?: string
}

export function AuthForm({ action, mode, notice }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const isSignUp = mode === "sign-up"

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {notice ? (
        <p
          className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email address
        </label>
        <input
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"
          disabled={pending}
          id="email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />
        <FieldErrors errors={state.fieldErrors?.email} id="email-error" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"
          disabled={pending}
          id="password"
          name="password"
          required
          type="password"
        />
        {isSignUp ? (
          <p className="text-xs text-muted-foreground">
            At least 8 characters with a letter and number.
          </p>
        ) : null}
        <FieldErrors errors={state.fieldErrors?.password} id="password-error" />
      </div>

      {isSignUp ? (
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"
            disabled={pending}
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
          />
          <FieldErrors
            errors={state.fieldErrors?.confirmPassword}
            id="confirm-password-error"
          />
        </div>
      ) : null}

      {state.message ? (
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-sm",
            state.status === "success"
              ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New to the screener?"}{" "}
        <Link
          className="font-medium text-foreground underline underline-offset-4"
          href={isSignUp ? "/login" : "/signup"}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}

function FieldErrors({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) {
    return null
  }

  return (
    <ul className="space-y-1 text-xs text-destructive" id={id}>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  )
}
