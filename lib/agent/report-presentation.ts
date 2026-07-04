import type { EvidenceItem, ScreeningReport } from "./report-schema"

export type AdvisoryNextStep =
  "Consider progressing" | "Manual review needed" | "More evidence needed"

export type RecruiterBrief = {
  nextStep: AdvisoryNextStep
  supportingReasons: EvidenceItem[]
  mostImportantGap: string
  firstVerificationAction: string
}

export function getRecruiterBrief(report: ScreeningReport): RecruiterBrief {
  const evidenceUnavailable = report.portfolioEvidence.status !== "inspected"
  const hasMissingMustHaves = report.missingSkills.length > 0

  const nextStep: AdvisoryNextStep =
    evidenceUnavailable || hasMissingMustHaves
      ? "More evidence needed"
      : report.recommendation === "weak_fit" || report.reviewPoints.length > 0
        ? "Manual review needed"
        : "Consider progressing"

  const mostImportantGap =
    report.missingSkills[0]?.claim ??
    report.weaknesses[0]?.claim ??
    (evidenceUnavailable
      ? report.portfolioEvidence.summary
      : "No material evidence gap was recorded.")

  const firstVerificationAction =
    report.reviewPoints[0]?.claim ??
    (report.missingSkills[0]
      ? `Request evidence for ${report.missingSkills[0].claim}.`
      : evidenceUnavailable
        ? "Ask the candidate for accessible portfolio evidence."
        : "Verify the strongest documented claim before progressing.")

  return {
    nextStep,
    supportingReasons: report.strengths
      .filter((item) => item.source !== "not_found")
      .slice(0, 3),
    mostImportantGap,
    firstVerificationAction,
  }
}
