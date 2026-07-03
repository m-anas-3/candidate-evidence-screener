import { z } from "zod"

export const evidenceSourceSchema = z.enum([
  "resume",
  "proposal",
  "portfolio",
  "not_found",
])

export const evidenceItemSchema = z
  .object({
    claim: z.string().trim().min(1).max(1_000),
    evidence: z.string().trim().min(1).max(2_000),
    source: evidenceSourceSchema,
  })
  .strict()
  .superRefine((item, context) => {
    if (
      item.source === "not_found" &&
      item.evidence.toLowerCase() !== "not found"
    ) {
      context.addIssue({
        code: "custom",
        message:
          'Evidence must be exactly "not found" when its source is not_found.',
        path: ["evidence"],
      })
    }
  })

const boundedEvidenceList = z.array(evidenceItemSchema).max(20)

export const proposalSpecificitySchema = z
  .object({
    score: z.number().int().min(0).max(15),
    specificSignals: z.array(z.string().trim().min(1).max(500)).max(10),
    templateSignals: z.array(z.string().trim().min(1).max(500)).max(10),
    evidence: boundedEvidenceList,
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict()

export const portfolioEvidenceSchema = z
  .object({
    score: z.number().int().min(0).max(15),
    inspectedUrl: z.url().max(2_048).nullable(),
    status: z.enum(["inspected", "unavailable", "unsafe"]),
    findings: boundedEvidenceList,
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict()

export const screeningReportSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    recommendation: z.enum(["strong_fit", "possible_fit", "weak_fit"]),
    scoring: z
      .object({
        jobRequirementsAndSkills: z.number().int().min(0).max(50),
        relevantExperience: z.number().int().min(0).max(20),
        proposalSpecificity: z.number().int().min(0).max(15),
        portfolioRelevance: z.number().int().min(0).max(15),
      })
      .strict(),
    summary: z.string().trim().min(1).max(3_000),
    strengths: boundedEvidenceList,
    weaknesses: boundedEvidenceList,
    matchedSkills: boundedEvidenceList,
    missingSkills: boundedEvidenceList,
    proposalSpecificityFindings: proposalSpecificitySchema,
    portfolioEvidence: portfolioEvidenceSchema,
    reviewPoints: boundedEvidenceList,
    outreachMessage: z.string().trim().min(1).max(5_000),
  })
  .strict()
  .superRefine((report, context) => {
    const calculatedScore =
      report.scoring.jobRequirementsAndSkills +
      report.scoring.relevantExperience +
      report.scoring.proposalSpecificity +
      report.scoring.portfolioRelevance

    if (report.score !== calculatedScore) {
      context.addIssue({
        code: "custom",
        message: "Score must equal the four weighted scoring categories.",
        path: ["score"],
      })
    }

    const expectedRecommendation =
      report.score >= 80
        ? "strong_fit"
        : report.score >= 60
          ? "possible_fit"
          : "weak_fit"

    if (report.recommendation !== expectedRecommendation) {
      context.addIssue({
        code: "custom",
        message: "Recommendation does not match the score band.",
        path: ["recommendation"],
      })
    }

    if (report.missingSkills.length > 0 && report.score > 79) {
      context.addIssue({
        code: "custom",
        message: "A missing must-have skill caps the score at 79.",
        path: ["score"],
      })
    }

    if (
      report.scoring.proposalSpecificity !==
      report.proposalSpecificityFindings.score
    ) {
      context.addIssue({
        code: "custom",
        message: "Proposal scores must match.",
        path: ["scoring", "proposalSpecificity"],
      })
    }

    if (report.scoring.portfolioRelevance !== report.portfolioEvidence.score) {
      context.addIssue({
        code: "custom",
        message: "Portfolio scores must match.",
        path: ["scoring", "portfolioRelevance"],
      })
    }
  })

export type EvidenceItem = z.infer<typeof evidenceItemSchema>
export type ProposalSpecificity = z.infer<typeof proposalSpecificitySchema>
export type ScreeningReport = z.infer<typeof screeningReportSchema>
