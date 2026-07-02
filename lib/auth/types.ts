export type AuthActionState = {
  fieldErrors?: {
    confirmPassword?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
  status?: "error" | "success"
}
