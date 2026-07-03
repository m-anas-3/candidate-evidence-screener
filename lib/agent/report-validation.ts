import type { ScreeningReport } from "./report-schema"
import { mentionsSkill } from "./skill-matching"

export type ReportContextValidationErrorCode =
  "contradictory_must_have" | "omitted_must_have" | "must_have_score_cap"

export class ReportContextValidationError extends Error {
  constructor(readonly code: ReportContextValidationErrorCode) {
    super("Report failed must-have coverage validation.")
    this.name = "ReportContextValidationError"
  }
}

export function validateReportMustHaveCoverage(
  report: ScreeningReport,
  mustHaveSkills: string[]
) {
  let hasUnsupportedSkill = false

  for (const skill of mustHaveSkills) {
    const supported = report.matchedSkills.some(
      (item) =>
        item.source !== "not_found" &&
        mentionsSkill(`${item.claim} ${item.evidence}`, skill)
    )
    const markedMissing = report.missingSkills.some((item) =>
      mentionsSkill(item.claim, skill)
    )

    if (supported && markedMissing) {
      throw new ReportContextValidationError("contradictory_must_have")
    }

    if (!supported) {
      hasUnsupportedSkill = true
      if (!markedMissing) {
        throw new ReportContextValidationError("omitted_must_have")
      }
    }
  }

  if (hasUnsupportedSkill && report.score > 79) {
    throw new ReportContextValidationError("must_have_score_cap")
  }

  return report
}
