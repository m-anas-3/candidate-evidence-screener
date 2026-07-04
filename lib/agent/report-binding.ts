import {
  screeningReportSchema,
  type ProposalSpecificity,
  type ScreeningReport,
} from "./report-schema"
import { validateReportMustHaveCoverage } from "./report-validation"

/** Replaces model-authored tool fields with results retained by this run. */
export function bindToolResultsToReport(
  report: ScreeningReport,
  proposalResult: ProposalSpecificity,
  portfolioUrl: string | null,
  mustHaveSkills: string[]
): ScreeningReport {
  const withoutPortfolioSources = (items: ScreeningReport["strengths"]) =>
    items.filter((item) => item.source !== "portfolio")

  const boundReport = screeningReportSchema.parse({
    ...report,
    strengths: withoutPortfolioSources(report.strengths),
    weaknesses: withoutPortfolioSources(report.weaknesses),
    matchedSkills: withoutPortfolioSources(report.matchedSkills),
    missingSkills: withoutPortfolioSources(report.missingSkills),
    reviewPoints: withoutPortfolioSources(report.reviewPoints),
    proposalSpecificityFindings: proposalResult,
    portfolioEvidence: {
      score: 0,
      inspectedUrl: portfolioUrl,
      status: "manual_review",
      findings: [],
      summary: portfolioUrl
        ? "Portfolio review is left to the recruiter and does not affect the score."
        : "A portfolio was not provided; this does not affect the score.",
    },
    scoring: {
      jobRequirementsAndSkills: report.scoring.jobRequirementsAndSkills,
      relevantExperience: report.scoring.relevantExperience,
      proposalSpecificity: proposalResult.score,
    },
  })

  return validateReportMustHaveCoverage(boundReport, mustHaveSkills)
}
