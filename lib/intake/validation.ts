import { z } from "zod"

export const MAX_RESUME_BYTES = 2 * 1024 * 1024

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(
      maximum,
      `${label} must be ${maximum.toLocaleString()} characters or fewer.`
    )

export const jobInputSchema = z.object({
  description: requiredText("Description", 20_000),
  mustHaveSkills: z
    .string()
    .transform((value) =>
      Array.from(
        new Set(
          value
            .split(/[\n,]/)
            .map((skill) => skill.trim())
            .filter(Boolean)
        )
      )
    )
    .refine((skills) => skills.length <= 50, {
      message: "Use no more than 50 must-have skills.",
    })
    .refine((skills) => skills.every((skill) => skill.length <= 100), {
      message: "Each skill must be 100 characters or fewer.",
    }),
  requirements: requiredText("Requirements", 20_000),
  title: requiredText("Title", 160),
})

export const candidateInputSchema = z.object({
  candidateId: z.uuid("Candidate ID is invalid."),
  jobId: z.uuid("Job ID is invalid."),
  name: requiredText("Candidate name", 200),
  portfolioUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed === "" ? null : trimmed
    },
    z
      .url("Enter a valid portfolio URL.")
      .max(2048, "Portfolio URL is too long.")
      .refine(
        (value) => ["http:", "https:"].includes(new URL(value).protocol),
        {
          message: "Portfolio URL must use HTTP or HTTPS.",
        }
      )
      .nullable()
  ),
  proposalText: requiredText("Proposal", 20_000),
  resumePath: z
    .string()
    .trim()
    .min(1, "Resume path is required.")
    .max(1024, "Resume path is too long."),
})

export type CandidateInput = z.infer<typeof candidateInputSchema>

export function validateResume(file: File): string | null {
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return "Choose a PDF file."
  }

  if (file.size === 0) {
    return "The PDF is empty."
  }

  if (file.size > MAX_RESUME_BYTES) {
    return "The PDF must be 2 MB or smaller."
  }

  return null
}
