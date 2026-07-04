"use client"

import { useActionState } from "react"
import { IconFlask, IconLoader2 } from "@tabler/icons-react"

import {
  createSyntheticSample,
  type SyntheticSampleActionState,
} from "@/app/(app)/dashboard/actions"
import { Button } from "@/components/ui/button"

const initialState: SyntheticSampleActionState = {}

export function CreateSyntheticSampleButton() {
  const [state, action, pending] = useActionState(
    createSyntheticSample,
    initialState
  )

  return (
    <form action={action}>
      <Button disabled={pending} type="submit" variant="outline" size="sm">
        {pending ? <IconLoader2 className="animate-spin" /> : <IconFlask />}
        {pending ? "Creating sample…" : "Try synthetic sample"}
      </Button>
      {state.status === "error" && state.message && (
        <p className="mt-2 max-w-xs text-xs text-destructive" role="alert">
          {state.message}
        </p>
      )}
    </form>
  )
}
