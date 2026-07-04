import {
  screeningReportSchema,
  type ProposalSpecificity,
  type ScreeningReport,
} from "./report-schema"
import { validateReportMustHaveCoverage } from "./report-validation"

export type PortfolioToolResult =
  | { finalUrl: string; status: "inspected" }
  | {
      finalUrl: null
      status: "not_provided" | "unavailable" | "unsafe"
    }

const unavailablePortfolioCopy: Record<
  Exclude<PortfolioToolResult["status"], "inspected">,
  string
> = {
  not_provided: "Portfolio evidence was not provided.",
  unavailable:
    "The portfolio source was unavailable, so no portfolio evidence could be assessed.",
  unsafe:
    "The portfolio source was blocked for safety, so no portfolio evidence could be assessed.",
}

/** Replaces model-authored tool fields with results retained by this run. */
export function bindToolResultsToReport(
  report: ScreeningReport,
  proposalResult: ProposalSpecificity,
  portfolioResult: PortfolioToolResult,
  mustHaveSkills: string[]
): ScreeningReport {
  const portfolioEvidence =
    portfolioResult.status === "inspected"
      ? {
          ...report.portfolioEvidence,
          inspectedUrl: portfolioResult.finalUrl,
          status: portfolioResult.status,
        }
      : {
          score: 0,
          inspectedUrl: null,
          status: portfolioResult.status,
          findings: [],
          summary: unavailablePortfolioCopy[portfolioResult.status],
        }

  const boundReport = screeningReportSchema.parse({
    ...report,
    proposalSpecificityFindings: proposalResult,
    portfolioEvidence,
    scoring: {
      ...report.scoring,
      proposalSpecificity: proposalResult.score,
      portfolioRelevance: portfolioEvidence.score,
    },
  })

  return validateReportMustHaveCoverage(boundReport, mustHaveSkills)
}
