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
  .transform((item) => ({
    ...item,
    // When the source is not_found the evidence field must be exactly
    // "not found". The LLM sometimes writes a descriptive sentence instead
    // of the required sentinel value, which would fail strict validation.
    // Auto-correct it here so the schema is robust to that common slip.
    evidence: item.source === "not_found" ? "not found" : item.evidence,
  }))

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

// The LLM-facing input schema. score and recommendation are accepted but
// ignored — they are always derived from the sub-scores after parsing so LLM
// arithmetic errors never cause a validation failure.
const screeningReportInputSchema = z
  .object({
    // Accept score/recommendation from the model but do not validate them here;
    // the transform below overwrites both with authoritative derived values.
    score: z.number().int().min(0).max(100).optional(),
    recommendation: z
      .enum(["strong_fit", "possible_fit", "weak_fit"])
      .optional(),
    scoring: z
      .object({
        jobRequirementsAndSkills: z.number().int().min(0).max(50),
        relevantExperience: z.number().int().min(0).max(20),
        // proposalSpecificity and portfolioRelevance must still match their
        // nested objects so the evidence and sub-scores stay consistent.
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
  .transform((report) => {
    // Auto-correct sub-score mismatches: when scoring.proposalSpecificity and
    // proposalSpecificityFindings.score disagree, trust the nested findings
    // object because it carries the evidence. Same for portfolioRelevance.
    // This avoids hard failures on minor LLM inconsistencies.
    const proposalScore = report.proposalSpecificityFindings.score
    const portfolioScore = report.portfolioEvidence.score

    const scoring =
      report.scoring.proposalSpecificity !== proposalScore ||
      report.scoring.portfolioRelevance !== portfolioScore
        ? {
            ...report.scoring,
            proposalSpecificity: proposalScore,
            portfolioRelevance: portfolioScore,
          }
        : report.scoring
  
    // Derive score from sub-scores — the LLM never has to do the arithmetic.
    let computedScore =
      scoring.jobRequirementsAndSkills +
      scoring.relevantExperience +
      scoring.proposalSpecificity +
      scoring.portfolioRelevance

    // Cap at 79 when any must-have skill is missing.
    if (report.missingSkills.length > 0 && computedScore > 79) {
      computedScore = 79
    }

    // Derive recommendation from the final score.
    const computedRecommendation =
      computedScore >= 80
        ? ("strong_fit" as const)
        : computedScore >= 60
          ? ("possible_fit" as const)
          : ("weak_fit" as const)

    return {
      ...report,
      scoring,
      score: computedScore,
      recommendation: computedRecommendation,
    }
  })

export const screeningReportSchema = screeningReportInputSchema

export type EvidenceItem = z.infer<typeof evidenceItemSchema>
export type ProposalSpecificity = z.infer<typeof proposalSpecificitySchema>
export type ScreeningReport = z.infer<typeof screeningReportSchema>
