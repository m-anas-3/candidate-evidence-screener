"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { AuthActionState } from "@/lib/auth/types"
import { createClient } from "@/lib/supabase/server"

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.")

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
})

const signUpSchema = z
  .object({
    confirmPassword: z.string(),
    email: emailSchema,
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Use no more than 72 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

function fieldsFrom(formData: FormData) {
  return {
    confirmPassword: formData.get("confirmPassword"),
    email: formData.get("email"),
    password: formData.get("password"),
  }
}

function invalidCredentials(): AuthActionState {
  return {
    eventId: crypto.randomUUID(),
    message: "The email or password is incorrect.",
    status: "error",
  }
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse(fieldsFrom(formData))

  if (!parsed.success) {
    return {
      eventId: crypto.randomUUID(),
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: "Check the highlighted fields.",
      status: "error",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        eventId: crypto.randomUUID(),
        message:
          "Email confirmation is still enabled in Supabase. Disable Confirm email for this MVP.",
        status: "error",
      }
    }

    return invalidCredentials()
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(fieldsFrom(formData))

  if (!parsed.success) {
    return {
      eventId: crypto.randomUUID(),
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: "Check the highlighted fields.",
      status: "error",
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      eventId: crypto.randomUUID(),
      message: "The account could not be created. Try again.",
      status: "error",
    }
  }

  if (!data.session) {
    return {
      eventId: crypto.randomUUID(),
      message:
        "Immediate sign-up is not enabled. Disable Confirm email in Supabase Auth settings.",
      status: "error",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
