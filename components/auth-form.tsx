"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [values, setValues] = useState({
    confirmPassword: "",
    email: "",
    password: "",
  })
  const isSignUp = mode === "sign-up"

  useEffect(() => {
    if (!state.message) return
    if (state.status === "success") {
      toast.success(state.message, { id: "auth-status" })
    }
    if (state.status === "error") {
      toast.error(state.message, { id: "auth-status" })
    }
  }, [state.eventId, state.message, state.status])

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {notice && (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted/50 px-3.5 py-2.5 text-[13px] text-muted-foreground"
        >
          {notice}
        </p>
      )}

      {/* Email */}
      <Field
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        disabled={pending}
        errors={state.fieldErrors?.email}
        errorId="email-error"
        value={values.email}
        onChange={(value) =>
          setValues((current) => ({ ...current, email: value }))
        }
      />

      {/* Password */}
      <div className="space-y-1.5">
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
          disabled={pending}
          errors={state.fieldErrors?.password}
          errorId="password-error"
          value={values.password}
          onChange={(value) =>
            setValues((current) => ({ ...current, password: value }))
          }
        />
        {isSignUp && (
          <p className="pl-0.5 text-[11px] text-muted-foreground">
            At least 8 characters with a letter and number.
          </p>
        )}
      </div>

      {/* Confirm password */}
      {isSignUp && (
        <Field
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          disabled={pending}
          errors={state.fieldErrors?.confirmPassword}
          errorId="confirm-password-error"
          value={values.confirmPassword}
          onChange={(value) =>
            setValues((current) => ({ ...current, confirmPassword: value }))
          }
        />
      )}

      <Button
        className="mt-1 h-10 w-full text-[13px] font-semibold tracking-tight"
        disabled={pending}
        size="lg"
        type="submit"
      >
        {pending && <IconLoader2 className="mr-2 size-3.5 animate-spin" />}
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </Button>

      <p className="pt-1 text-center text-[12px] text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New here?"}{" "}
        <Link
          href={isSignUp ? "/login" : "/signup"}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Reusable field
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  disabled,
  errors,
  errorId,
  value,
  onChange,
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  placeholder: string
  disabled: boolean
  errors?: string[]
  errorId: string
  value: string
  onChange: (value: string) => void
}) {
  const hasError = Boolean(errors?.length)
  const isPassword = type === "password"
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={isPassword && passwordVisible ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          className={cn(
            "h-10 rounded-lg border-border bg-muted/30 px-3 text-[13px] transition-all",
            "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15",
            isPassword && "pr-10",
            hasError &&
              "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/15"
          )}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? (
              <IconEyeOff aria-hidden="true" className="size-4" />
            ) : (
              <IconEye aria-hidden="true" className="size-4" />
            )}
          </Button>
        )}
      </div>
      {hasError && (
        <ul id={errorId} className="space-y-0.5">
          {errors!.map((e) => (
            <li key={e} className="pl-0.5 text-[11px] text-destructive">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
