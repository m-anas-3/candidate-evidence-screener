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
    status: z.enum([
      "manual_review",
      "inspected",
      "not_provided",
      "unavailable",
      "unsafe",
    ]),
    findings: boundedEvidenceList,
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict()

// The LLM-facing input schema. score and recommendation are accepted but
// ignored — they are always derived from the sub-scores after parsing so LLM
// arithmetic errors never cause a validation failure.
const screeningReportObjectSchema = z.object({
  // Accept score/recommendation from the model but do not validate them here;
  // the transform below overwrites both with authoritative derived values.
  score: z.number().int().min(0).max(100).optional(),
  recommendation: z.enum(["strong_fit", "possible_fit", "weak_fit"]).optional(),
  scoring: z
    .object({
      jobRequirementsAndSkills: z.number().int().min(0).max(55),
      relevantExperience: z.number().int().min(0).max(30),
      proposalSpecificity: z.number().int().min(0).max(15),
      // Accepted only so reports created under the former 50/20/15/15
      // rubric remain readable. New reports omit this field.
      portfolioRelevance: z.number().int().min(0).max(15).optional(),
    })
    .strict(),
  summary: z.string().trim().min(1).max(3_000),
  strengths: boundedEvidenceList,
  weaknesses: boundedEvidenceList,
  matchedSkills: boundedEvidenceList,
  missingSkills: boundedEvidenceList,
  proposalSpecificityFindings: proposalSpecificitySchema,
  portfolioEvidence: portfolioEvidenceSchema.optional(),
  reviewPoints: boundedEvidenceList,
  outreachMessage: z.string().trim().min(1).max(5_000),
})

const modelScoreInput = (max: number) =>
  z.number().describe(`Integer score from 0 to ${max}.`)

const toolEvidenceItemSchema = z
  .object({
    claim: z.string().trim().min(1).max(1_000),
    evidence: z.string().trim().min(1).max(2_000),
    source: evidenceSourceSchema,
  })
  .strict()

const toolEvidenceListSchema = z.array(toolEvidenceItemSchema).max(20)

const toolProposalSpecificitySchema = z
  .object({
    score: modelScoreInput(15),
    specificSignals: z.array(z.string().trim().min(1).max(500)).max(10),
    templateSignals: z.array(z.string().trim().min(1).max(500)).max(10),
    evidence: toolEvidenceListSchema,
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict()

const toolPortfolioEvidenceSchema = z
  .object({
    score: modelScoreInput(15),
    inspectedUrl: z.url().max(2_048).nullable(),
    status: z.enum([
      "manual_review",
      "inspected",
      "not_provided",
      "unavailable",
      "unsafe",
    ]),
    findings: toolEvidenceListSchema,
    summary: z.string().trim().min(1).max(2_000),
  })
  .strict()

// LangChain must convert tool schemas to JSON Schema, so this input contract
// intentionally contains no transforms. It accepts numeric score mistakes at
// the tool boundary; normalizeModelReportScores clamps them before the strict
// persisted-report schema is applied.
export const screeningReportToolInputSchema = z
  .object({
    score: modelScoreInput(100).optional(),
    recommendation: z
      .enum(["strong_fit", "possible_fit", "weak_fit"])
      .optional(),
    scoring: z
      .object({
        jobRequirementsAndSkills: modelScoreInput(55),
        relevantExperience: modelScoreInput(30),
        proposalSpecificity: modelScoreInput(15),
        portfolioRelevance: modelScoreInput(15).optional(),
      })
      .strict(),
    summary: z.string().trim().min(1).max(3_000),
    strengths: toolEvidenceListSchema,
    weaknesses: toolEvidenceListSchema,
    matchedSkills: toolEvidenceListSchema,
    missingSkills: toolEvidenceListSchema,
    proposalSpecificityFindings: toolProposalSpecificitySchema,
    portfolioEvidence: toolPortfolioEvidenceSchema.optional(),
    reviewPoints: toolEvidenceListSchema,
    outreachMessage: z.string().trim().min(1).max(5_000),
  })
  .strict()

type ScreeningReportToolInput = z.infer<typeof screeningReportToolInputSchema>

const clampModelScore = (score: number, max: number) =>
  Math.min(max, Math.max(0, Math.round(score)))

export function normalizeModelReportScores(report: ScreeningReportToolInput) {
  return {
    ...report,
    score:
      report.score === undefined
        ? undefined
        : clampModelScore(report.score, 100),
    scoring: {
      jobRequirementsAndSkills: clampModelScore(
        report.scoring.jobRequirementsAndSkills,
        55
      ),
      relevantExperience: clampModelScore(
        report.scoring.relevantExperience,
        30
      ),
      proposalSpecificity: clampModelScore(
        report.scoring.proposalSpecificity,
        15
      ),
      ...(report.scoring.portfolioRelevance === undefined
        ? {}
        : {
            portfolioRelevance: clampModelScore(
              report.scoring.portfolioRelevance,
              15
            ),
          }),
    },
    proposalSpecificityFindings: {
      ...report.proposalSpecificityFindings,
      score: clampModelScore(report.proposalSpecificityFindings.score, 15),
    },
    portfolioEvidence:
      report.portfolioEvidence === undefined
        ? undefined
        : {
            ...report.portfolioEvidence,
            score: clampModelScore(report.portfolioEvidence.score, 15),
          },
  }
}

const screeningReportInputSchema = screeningReportObjectSchema.transform(
  (report) => {
    const proposalScore = report.proposalSpecificityFindings.score
    const portfolioEvidence = report.portfolioEvidence ?? {
      score: 0,
      inspectedUrl: null,
      status: "manual_review" as const,
      findings: [],
      summary:
        "Portfolio review is left to the recruiter and does not affect the score.",
    }
    const legacyPortfolioScore = report.scoring.portfolioRelevance
    const scoring =
      legacyPortfolioScore === undefined
        ? {
            jobRequirementsAndSkills: report.scoring.jobRequirementsAndSkills,
            relevantExperience: report.scoring.relevantExperience,
            proposalSpecificity: proposalScore,
          }
        : {
            jobRequirementsAndSkills: report.scoring.jobRequirementsAndSkills,
            relevantExperience: report.scoring.relevantExperience,
            proposalSpecificity: proposalScore,
            portfolioRelevance: legacyPortfolioScore,
          }

    // Derive score from sub-scores — the LLM never has to do the arithmetic.
    let computedScore =
      scoring.jobRequirementsAndSkills +
      scoring.relevantExperience +
      scoring.proposalSpecificity +
      ("portfolioRelevance" in scoring ? (scoring.portfolioRelevance ?? 0) : 0)

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
      portfolioEvidence,
      scoring,
      score: computedScore,
      recommendation: computedRecommendation,
    }
  }
)

export const screeningReportSchema = screeningReportInputSchema

export type EvidenceItem = z.infer<typeof evidenceItemSchema>
export type ProposalSpecificity = z.infer<typeof proposalSpecificitySchema>
export type ScreeningReport = z.infer<typeof screeningReportSchema>
