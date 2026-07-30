"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteCandidate } from "@/app/(app)/dashboard/candidates/actions"
import { deleteJob } from "@/app/(app)/dashboard/jobs/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DeleteRecordButtonProps = {
  id: string
  name: string
  recordType: "candidate" | "role"
  redirectTo?: string
  showLabel?: boolean
  className?: string
}

export function DeleteRecordButton({
  id,
  name,
  recordType,
  redirectTo,
  showLabel = false,
  className,
}: DeleteRecordButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const label = recordType === "role" ? "role" : "candidate"

  function handleDelete() {
    startTransition(async () => {
      const result =
        recordType === "role"
          ? await deleteJob(id, redirectTo)
          : await deleteCandidate(id, redirectTo)

      if (!result.ok) {
        toast.error(result.message ?? `The ${label} could not be deleted.`)
        return
      }

      setOpen(false)
      toast.success(`${recordType === "role" ? "Role" : "Candidate"} deleted.`)
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "border-destructive/25 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
            !showLabel && "size-8 px-0",
            className
          )}
          aria-label={`Delete ${label} ${name}`}
          title={`Delete ${label}`}
        >
          <IconTrash className="size-3.5" />
          {showLabel ? "Delete" : null}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{name}</span> will be
            permanently deleted
            {recordType === "role"
              ? ", including all of its candidates, reports, and conversations."
              : ", including its report and conversation history."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-foreground text-background hover:bg-foreground/85"
          >
            {isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconTrash className="size-4" />
            )}
            {isPending ? "Deleting…" : `Delete ${label}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
