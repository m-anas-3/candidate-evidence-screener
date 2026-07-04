export type AuthActionState = {
  eventId?: string
  fieldErrors?: {
    confirmPassword?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
  status?: "error" | "success"
}
