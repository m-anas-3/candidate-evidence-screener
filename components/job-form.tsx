"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { createJob } from "@/app/(app)/dashboard/jobs/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { IntakeActionState } from "@/lib/intake/types"

const initialState: IntakeActionState = {}

export function JobForm() {
  const [state, formAction, pending] = useActionState(createJob, initialState)

  useEffect(() => {
    if (state.status === "error" && state.message) toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormField error={state.fieldErrors?.title} id="title" label="Job title">
        <Input
          aria-describedby={
            state.fieldErrors?.title ? "title-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.title)}
          className="h-10"
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
        <Textarea
          aria-describedby={
            state.fieldErrors?.description ? "description-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.description)}
          className="min-h-28 resize-y"
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
        <Textarea
          aria-describedby={
            state.fieldErrors?.requirements ? "requirements-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.requirements)}
          className="min-h-28 resize-y"
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
        <Textarea
          aria-describedby={
            state.fieldErrors?.mustHaveSkills
              ? "mustHaveSkills-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.mustHaveSkills)}
          className="min-h-20 resize-y"
          disabled={pending}
          id="mustHaveSkills"
          name="mustHaveSkills"
          placeholder="Next.js, TypeScript, PostgreSQL"
        />
      </FormField>

      {state.message ? (
        <p
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-2">
        <Button
          asChild
          variant="outline"
          className="flex-1 sm:flex-none"
          disabled={pending}
          type="button"
        >
          <Link href="/dashboard/jobs">Cancel</Link>
        </Button>
        <Button
          className="flex-1 bg-primary hover:bg-primary/80 sm:flex-none"
          disabled={pending}
          type="submit"
        >
          {pending ? "Creating role…" : "Create role"}
        </Button>
      </div>
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
      <Label htmlFor={id}>{label}</Label>
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
