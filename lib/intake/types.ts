export type IntakeActionState = {
  fieldErrors?: Record<string, string[] | undefined>
  message?: string
  status?: "error" | "success"
}

export type CandidateActionResult = {
  fieldErrors?: Record<string, string[] | undefined>
  message?: string
  ok: boolean
}
