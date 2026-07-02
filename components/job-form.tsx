"use client"

import { useActionState } from "react"

import { createJob } from "@/app/(app)/dashboard/jobs/actions"
import { Button } from "@/components/ui/button"
import type { IntakeActionState } from "@/lib/intake/types"

const initialState: IntakeActionState = {}
const fieldClassName =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"

export function JobForm() {
  const [state, formAction, pending] = useActionState(createJob, initialState)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField error={state.fieldErrors?.title} id="title" label="Job title">
        <input
          aria-describedby={
            state.fieldErrors?.title ? "title-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.title)}
          className={`${fieldClassName} h-11`}
          disabled={pending}
          id="title"
          maxLength={160}
          name="title"
          placeholder="Senior full-stack engineer"
          required
        />
      </FormField>

      <FormField
        error={state.fieldErrors?.description}
        id="description"
        label="Job description"
      >
        <textarea
          aria-describedby={
            state.fieldErrors?.description ? "description-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.description)}
          className={`${fieldClassName} min-h-32 resize-y`}
          disabled={pending}
          id="description"
          maxLength={20000}
          name="description"
          placeholder="Describe the project, team, and expected outcomes."
          required
        />
      </FormField>

      <FormField
        error={state.fieldErrors?.requirements}
        id="requirements"
        label="Requirements"
      >
        <textarea
          aria-describedby={
            state.fieldErrors?.requirements ? "requirements-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.requirements)}
          className={`${fieldClassName} min-h-32 resize-y`}
          disabled={pending}
          id="requirements"
          maxLength={20000}
          name="requirements"
          placeholder="List the experience and evidence a strong candidate should have."
          required
        />
      </FormField>

      <FormField
        error={state.fieldErrors?.mustHaveSkills}
        hint="Separate skills with commas or new lines."
        id="mustHaveSkills"
        label="Must-have skills"
      >
        <textarea
          aria-describedby={
            state.fieldErrors?.mustHaveSkills
              ? "mustHaveSkills-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.mustHaveSkills)}
          className={`${fieldClassName} min-h-24 resize-y`}
          disabled={pending}
          id="mustHaveSkills"
          name="mustHaveSkills"
          placeholder="Next.js, TypeScript, PostgreSQL"
        />
      </FormField>

      {state.message ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <Button disabled={pending} size="lg" type="submit">
        {pending ? "Creating job…" : "Create job"}
      </Button>
    </form>
  )
}

function FormField({
  children,
  error,
  hint,
  id,
  label,
}: {
  children: React.ReactNode
  error?: string[]
  hint?: string
  id: string
  label: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error?.length ? (
        <ul className="space-y-1 text-xs text-destructive" id={`${id}-error`}>
          {error.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
