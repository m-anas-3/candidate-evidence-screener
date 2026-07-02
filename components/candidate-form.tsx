"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createCandidate } from "@/app/(app)/dashboard/candidates/actions"
import { Button } from "@/components/ui/button"
import {
  candidateInputSchema,
  MAX_RESUME_BYTES,
  validateResume,
} from "@/lib/intake/validation"
import { createClient } from "@/lib/supabase/client"

const fieldClassName =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive"

type FormErrors = Record<string, string[] | undefined>

export function CandidateForm({
  jobId,
  userId,
}: {
  jobId: string
  userId: string
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<string>()
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setMessage(undefined)

    const form = event.currentTarget
    const formData = new FormData(form)
    const resume = formData.get("resume")

    if (!(resume instanceof File)) {
      setErrors({ resume: ["Choose a PDF resume."] })
      return
    }

    const resumeError = validateResume(resume)

    if (resumeError) {
      setErrors({ resume: [resumeError] })
      return
    }

    const candidateId = crypto.randomUUID()
    const resumePath = `${userId}/${candidateId}/resume.pdf`
    const input = {
      candidateId,
      jobId,
      name: String(formData.get("name") ?? ""),
      portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
      proposalText: String(formData.get("proposalText") ?? ""),
      resumePath,
    }
    const parsed = candidateInputSchema.safeParse(input)

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      setMessage("Check the highlighted fields.")
      return
    }

    setPending(true)
    const supabase = createClient()

    try {
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(resumePath, resume, {
          cacheControl: "3600",
          contentType: "application/pdf",
          upsert: false,
        })

      if (uploadError) {
        console.error("Resume upload failed", { code: uploadError.name })
        setMessage("The resume could not be uploaded. Try again.")
        return
      }

      const result = await createCandidate(parsed.data)

      if (!result.ok) {
        await removeUploadedResume(resumePath)
        setErrors(result.fieldErrors ?? {})
        setMessage(result.message ?? "The candidate could not be created.")
        return
      }

      router.push(`/dashboard/candidates/${candidateId}`)
      router.refresh()
    } catch {
      // A transport failure can occur after the database insert commits. Keep
      // the private object rather than risk leaving a candidate without a file.
      setMessage("The candidate could not be created. Try again.")
    } finally {
      setPending(false)
    }

    async function removeUploadedResume(path: string) {
      const { error } = await supabase.storage.from("resumes").remove([path])

      if (error) {
        console.error("Resume cleanup failed", { code: error.name })
      }
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <FormField error={errors.name} id="name" label="Candidate name">
        <input
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="off"
          className={`${fieldClassName} h-11`}
          disabled={pending}
          id="name"
          maxLength={200}
          name="name"
          placeholder="Alex Morgan"
          required
        />
      </FormField>

      <FormField error={errors.proposalText} id="proposalText" label="Proposal">
        <textarea
          aria-describedby={
            errors.proposalText ? "proposalText-error" : undefined
          }
          aria-invalid={Boolean(errors.proposalText)}
          className={`${fieldClassName} min-h-36 resize-y`}
          disabled={pending}
          id="proposalText"
          maxLength={20000}
          name="proposalText"
          placeholder="Paste the candidate's proposal exactly as submitted."
          required
        />
      </FormField>

      <FormField
        error={errors.portfolioUrl}
        hint="One public HTTP or HTTPS URL. It will be inspected safely during analysis."
        id="portfolioUrl"
        label="Portfolio URL"
      >
        <input
          aria-describedby={
            errors.portfolioUrl ? "portfolioUrl-error" : undefined
          }
          aria-invalid={Boolean(errors.portfolioUrl)}
          className={`${fieldClassName} h-11`}
          disabled={pending}
          id="portfolioUrl"
          maxLength={2048}
          name="portfolioUrl"
          placeholder="https://example.com/portfolio"
          required
          type="url"
        />
      </FormField>

      <FormField
        error={errors.resume}
        hint="PDF only, up to 2 MB. The file is uploaded directly to private storage."
        id="resume"
        label="Resume"
      >
        <input
          accept="application/pdf,.pdf"
          aria-describedby={errors.resume ? "resume-error" : undefined}
          aria-invalid={Boolean(errors.resume)}
          className={`${fieldClassName} file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium`}
          disabled={pending}
          id="resume"
          name="resume"
          required
          type="file"
        />
      </FormField>

      {message ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <Button disabled={pending} size="lg" type="submit">
        {pending ? "Uploading candidate…" : "Add candidate"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Maximum file size: {MAX_RESUME_BYTES / 1024 / 1024} MB.
      </p>
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
          {error.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
