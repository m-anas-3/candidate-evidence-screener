"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconLink,
  IconNotes,
  IconPlus,
  IconUpload,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react"

import { createCandidate } from "@/app/(app)/dashboard/candidates/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  candidateInputSchema,
  MAX_RESUME_BYTES,
  validateResume,
} from "@/lib/intake/validation"
import { createClient } from "@/lib/supabase/client"

type FormErrors = Record<string, string[] | undefined>

interface Job {
  id: string
  title: string
  must_have_skills: string[]
}

interface AddCandidateSheetProps {
  job: Job
  userId: string
  trigger?: React.ReactNode
}

function CandidateSheetForm({
  job,
  userId,
  onSuccess,
  onCancel,
}: {
  job: Job
  userId: string
  onSuccess: (candidateId: string) => void
  onCancel: () => void
}) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<string>()
  const [pending, setPending] = useState(false)
  const [fileName, setFileName] = useState<string>()

  useEffect(() => {
    if (message) toast.error(message)
  }, [message])

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
      jobId: job.id,
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
        setMessage("The resume could not be uploaded. Try again.")
        return
      }

      const result = await createCandidate(parsed.data)

      if (!result.ok) {
        await supabase.storage.from("resumes").remove([resumePath])
        setErrors(result.fieldErrors ?? {})
        setMessage(result.message ?? "The candidate could not be created.")
        return
      }

      onSuccess(candidateId)
    } catch {
      setMessage("The candidate could not be created. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="mt-2 space-y-5 px-6" noValidate onSubmit={handleSubmit}>
      {/* Job context banner */}
      <div className="space-y-1.5 rounded-lg border border-primary/15 bg-primary/5 px-3.5 py-3">
        <p className="text-2xs font-semibold tracking-wider text-primary/80 uppercase">
          Adding to role
        </p>
        <p className="text-sm font-semibold text-foreground">{job.title}</p>
        {job.must_have_skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {job.must_have_skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-2xs px-1.5 py-0 font-normal"
              >
                {skill}
              </Badge>
            ))}
            {job.must_have_skills.length > 4 && (
              <Badge
                variant="outline"
                className="text-2xs px-1.5 py-0 font-normal"
              >
                +{job.must_have_skills.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator className="bg-border/40" />

      {/* Name */}
      <div className="space-y-2">
        <Label
          htmlFor="sheet-name"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <IconUser className="size-3.5 text-muted-foreground" />
          Candidate name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sheet-name"
          name="name"
          placeholder="Alex Morgan"
          disabled={pending}
          maxLength={200}
          required
          className="h-10"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {errors.name.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Proposal */}
      <div className="space-y-2">
        <Label
          htmlFor="sheet-proposal"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <IconNotes className="size-3.5 text-muted-foreground" />
          Proposal / Cover Letter <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="sheet-proposal"
          name="proposalText"
          placeholder="Paste the candidate's proposal exactly as submitted."
          disabled={pending}
          maxLength={20000}
          required
          className="min-h-[120px] resize-y"
          aria-invalid={Boolean(errors.proposalText)}
        />
        {errors.proposalText && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {errors.proposalText.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Portfolio */}
      <div className="space-y-2">
        <Label
          htmlFor="sheet-portfolio"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <IconLink className="size-3.5 text-muted-foreground" />
          Portfolio URL <span className="text-destructive">*</span>
        </Label>
        <p className="-mt-1 text-xs text-muted-foreground">
          Public URL — will be inspected during analysis.
        </p>
        <Input
          id="sheet-portfolio"
          name="portfolioUrl"
          type="url"
          placeholder="https://github.com/alexmorgan"
          disabled={pending}
          maxLength={2048}
          required
          className="h-10"
          aria-invalid={Boolean(errors.portfolioUrl)}
        />
        {errors.portfolioUrl && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {errors.portfolioUrl.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Resume */}
      <div className="space-y-2">
        <Label
          htmlFor="sheet-resume"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <IconUpload className="size-3.5 text-muted-foreground" />
          PDF Resume <span className="text-destructive">*</span>
        </Label>
        <p className="-mt-1 text-xs text-muted-foreground">
          PDF only · Max {MAX_RESUME_BYTES / 1024 / 1024} MB · Stored in private
          storage.
        </p>
        <div
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            errors.resume
              ? "border-destructive/40 bg-destructive/5"
              : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-primary/5"
          }`}
        >
          <input
            id="sheet-resume"
            name="resume"
            type="file"
            accept="application/pdf,.pdf"
            disabled={pending}
            required
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-invalid={Boolean(errors.resume)}
            onChange={(e) => {
              const file = e.target.files?.[0]
              setFileName(file?.name)
            }}
          />
          <div className="pointer-events-none flex flex-col items-center justify-center px-4 py-5 text-center">
            <IconUpload
              className={`mb-2 size-6 ${fileName ? "text-primary" : "text-muted-foreground"}`}
            />
            <p className="text-sm font-medium text-foreground">
              {fileName ? fileName : "Click to upload resume"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PDF files only
            </p>
          </div>
        </div>
        {errors.resume && (
          <ul className="space-y-0.5 text-xs text-destructive">
            {errors.resume.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2.5 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-primary font-semibold hover:bg-primary/85"
        >
          {pending ? (
            <>
              <IconUserPlus className="mr-1.5 size-3.5 animate-pulse" />
              Uploading…
            </>
          ) : (
            <>
              <IconUserPlus className="mr-1.5 size-3.5" />
              Add candidate
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function AddCandidateSheet({
  job,
  userId,
  trigger,
}: AddCandidateSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSuccess(candidateId: string) {
    setOpen(false)
    toast.success("Candidate added", {
      description: "The resume is ready to be extracted and analyzed.",
    })
    router.push(`/dashboard/jobs/${job.id}/candidates/${candidateId}`)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="bg-primary font-semibold hover:bg-primary/85">
            <IconPlus className="mr-1.5 size-4" />
            Add candidate
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-[500px]"
        side="right"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconUserPlus className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-base font-semibold">
                Add candidate
              </SheetTitle>
              <SheetDescription className="text-xs">
                Upload evidence to screen against role criteria.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <CandidateSheetForm
          job={job}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
