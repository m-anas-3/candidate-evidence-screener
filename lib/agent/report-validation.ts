import { screeningReportSchema, type ScreeningReport } from "./report-schema"
import { mentionsSkill } from "./skill-matching"

export type ReportContextValidationErrorCode =
  "contradictory_must_have" | "omitted_must_have" | "must_have_score_cap"

export class ReportContextValidationError extends Error {
  constructor(readonly code: ReportContextValidationErrorCode) {
    super("Report failed must-have coverage validation.")
    this.name = "ReportContextValidationError"
  }
}

/**
 * Validates and auto-repairs must-have skill coverage in a report.
 *
 * Rather than throwing on every LLM slip, this function fixes the three
 * common mistakes in-place and returns the corrected report:
 *
 * - contradictory_must_have: skill appears in both matchedSkills and
 *   missingSkills → remove it from missingSkills (evidence wins).
 * - omitted_must_have: skill has no evidence and is absent from missingSkills
 *   → add a not_found entry to missingSkills so the cap logic can apply.
 * - must_have_score_cap: score > 79 with an unsupported must-have → cap the
 *   score here, where the job's declared must-haves are available.
 *
 * The score and recommendation fields are read-only on the incoming type so
 * we return a new object when either list changes.
 */
export function validateReportMustHaveCoverage(
  report: ScreeningReport,
  mustHaveSkills: string[]
): ScreeningReport {
  const missingSkills = [...report.missingSkills]
  let changed = false
  let hasUnsupportedMustHave = false

  for (const skill of mustHaveSkills) {
    const supported = report.matchedSkills.some(
      (item) =>
        item.source !== "not_found" &&
        mentionsSkill(`${item.claim} ${item.evidence}`, skill)
    )
    const missingIndex = missingSkills.findIndex((item) =>
      mentionsSkill(item.claim, skill)
    )
    const markedMissing = missingIndex !== -1

    if (!supported) {
      hasUnsupportedMustHave = true
    }

    if (supported && markedMissing) {
      // Contradictory: evidence exists but also marked missing — trust evidence.
      missingSkills.splice(missingIndex, 1)
      changed = true
      continue
    }

    if (!supported && !markedMissing) {
      // Omitted: no evidence and not listed as missing — add sentinel entry.
      missingSkills.push({
        claim: skill,
        evidence: "not found",
        source: "not_found",
      })
      changed = true
    }
  }

  const validatedReport = changed
    ? screeningReportSchema.parse({ ...report, missingSkills })
    : report

  // Only this context-aware validation step knows which skills the recruiter
  // explicitly declared as must-haves. Other missing skills remain useful in
  // the report, but must not prevent a Strong Fit recommendation.
  if (hasUnsupportedMustHave && validatedReport.score > 79) {
    return {
      ...validatedReport,
      score: 79,
      recommendation: "possible_fit",
    }
  }

  return validatedReport
}
