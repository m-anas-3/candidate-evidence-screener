export type IntakeActionState = {
  eventId?: string
  fieldErrors?: Record<string, string[] | undefined>
  message?: string
  status?: "error" | "success"
  jobId?: string
}

export type CandidateActionResult = {
  fieldErrors?: Record<string, string[] | undefined>
  message?: string
  ok: boolean
}
