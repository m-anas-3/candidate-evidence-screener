"use client"

import { useEffect, useActionState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconBriefcase, IconPlus, IconSparkles } from "@tabler/icons-react"

import { createJobForDialog } from "@/app/(app)/dashboard/jobs/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { IntakeActionState } from "@/lib/intake/types"
import { useState } from "react"

const initialState: IntakeActionState = {}

function JobDialogForm({ onSuccess }: { onSuccess: (jobId: string) => void }) {
  const [state, formAction, pending] = useActionState(
    createJobForDialog,
    initialState
  )

  useEffect(() => {
    if (state.status === "success" && state.jobId) {
      onSuccess(state.jobId)
    } else if (state.status === "error" && state.message) {
      toast.error(state.message)
    }
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="dialog-title" className="text-sm font-medium">
          Job title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dialog-title"
          name="title"
          placeholder="Senior Full-Stack Engineer"
          disabled={pending}
          maxLength={160}
          required
          className="h-10"
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {state.fieldErrors.title.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <Separator className="bg-border/40" />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="dialog-description" className="text-sm font-medium">
          Job description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="dialog-description"
          name="description"
          placeholder="Describe the project, team context, and expected outcomes."
          disabled={pending}
          maxLength={20000}
          required
          className="min-h-[100px] resize-y"
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />
        {state.fieldErrors?.description && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {state.fieldErrors.description.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label htmlFor="dialog-requirements" className="text-sm font-medium">
          Requirements <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="dialog-requirements"
          name="requirements"
          placeholder="List the experience and evidence a strong candidate should have."
          disabled={pending}
          maxLength={20000}
          required
          className="min-h-[90px] resize-y"
          aria-invalid={Boolean(state.fieldErrors?.requirements)}
        />
        {state.fieldErrors?.requirements && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {state.fieldErrors.requirements.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Must-have skills */}
      <div className="space-y-2">
        <Label htmlFor="dialog-skills" className="text-sm font-medium">
          Must-have skills
        </Label>
        <p className="-mt-1 text-xs text-muted-foreground">
          Separate with commas or new lines.
        </p>
        <Textarea
          id="dialog-skills"
          name="mustHaveSkills"
          placeholder="Next.js, TypeScript, PostgreSQL"
          disabled={pending}
          maxLength={20000}
          className="min-h-[72px] resize-y"
        />
        {state.fieldErrors?.mustHaveSkills && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {state.fieldErrors.mustHaveSkills.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Global error */}
      {state.status === "error" && state.message && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-xs text-destructive"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-primary font-semibold hover:bg-primary/85"
        >
          {pending ? (
            <>
              <IconSparkles className="mr-1.5 size-3.5 animate-pulse" />
              Creating role…
            </>
          ) : (
            <>
              <IconBriefcase className="mr-1.5 size-3.5" />
              Create role
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

interface CreateJobDialogProps {
  trigger?: React.ReactNode
}

export function CreateJobDialog({ trigger }: CreateJobDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSuccess(jobId: string) {
    setOpen(false)
    toast.success("Role created")
    router.push(`/dashboard/jobs/${jobId}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-primary font-semibold hover:bg-primary/85">
            <IconPlus className="mr-1.5 size-4" />
            Create role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader className="pb-2">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBriefcase className="size-4" />
            </span>
            <DialogTitle className="text-lg font-semibold">
              Create a new role
            </DialogTitle>
          </div>
          <DialogDescription className="pl-10 text-xs text-muted-foreground">
            Define the screening criteria. Candidates added to this role will be
            evaluated against these requirements.
          </DialogDescription>
        </DialogHeader>

        <Separator className="mb-4 bg-border/40" />

        <JobDialogForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
