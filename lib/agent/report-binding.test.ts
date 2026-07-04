import { describe, expect, it } from "vitest"

import { bindToolResultsToReport } from "@/lib/agent/report-binding"
import { screeningReportSchema } from "@/lib/agent/report-schema"

const evidence = {
  claim: "TypeScript",
  evidence: "Built a TypeScript service.",
  source: "resume" as const,
}

function report() {
  return screeningReportSchema.parse({
    scoring: {
      jobRequirementsAndSkills: 55,
      relevantExperience: 30,
      proposalSpecificity: 15,
    },
    summary: "Documented match.",
    strengths: [evidence],
    weaknesses: [],
    matchedSkills: [evidence],
    missingSkills: [],
    proposalSpecificityFindings: {
      score: 15,
      specificSignals: ["Fabricated"],
      templateSignals: [],
      evidence: [evidence],
      summary: "Fabricated proposal result.",
    },
    portfolioEvidence: {
      score: 15,
      inspectedUrl: "https://wrong.example/",
      status: "inspected",
      findings: [{ ...evidence, source: "portfolio" }],
      summary: "Fabricated portfolio result.",
    },
    reviewPoints: [],
    outreachMessage: "Draft message.",
  })
}

const proposalResult = {
  score: 4,
  specificSignals: ["Names the job title."],
  templateSignals: [],
  evidence: [
    {
      claim: "Observable proposal specificity",
      evidence: "Names the job title.",
      source: "proposal" as const,
    },
  ],
  summary: "One observable signal.",
}

describe("bindToolResultsToReport", () => {
  it("binds proposal findings and score to the proposal tool result", () => {
    const bound = bindToolResultsToReport(
      report(),
      proposalResult,
      "https://portfolio.example/work",
      ["TypeScript"]
    )

    expect(bound.proposalSpecificityFindings).toEqual(proposalResult)
    expect(bound.scoring.proposalSpecificity).toBe(4)
    expect(bound.score).toBe(89)
  })

  it("leaves a submitted portfolio for manual review without scoring it", () => {
    const bound = bindToolResultsToReport(
      report(),
      proposalResult,
      "https://portfolio.example/work",
      ["TypeScript"]
    )

    expect(bound.portfolioEvidence).toEqual({
      findings: [],
      inspectedUrl: "https://portfolio.example/work",
      score: 0,
      status: "manual_review",
      summary:
        "Portfolio review is left to the recruiter and does not affect the score.",
    })
    expect(bound.scoring).not.toHaveProperty("portfolioRelevance")
  })

  it("does not penalize a candidate without a portfolio", () => {
    const withPortfolio = bindToolResultsToReport(
      report(),
      proposalResult,
      "https://portfolio.example/work",
      ["TypeScript"]
    )
    const withoutPortfolio = bindToolResultsToReport(
      report(),
      proposalResult,
      null,
      ["TypeScript"]
    )

    expect(withoutPortfolio.score).toBe(withPortfolio.score)
    expect(withoutPortfolio.portfolioEvidence).toMatchObject({
      inspectedUrl: null,
      score: 0,
      status: "manual_review",
    })
  })

  it("repairs omitted must-haves and applies the score cap", () => {
    const bound = bindToolResultsToReport(report(), proposalResult, null, [
      "TypeScript",
      "Kubernetes",
    ])

    expect(bound.missingSkills).toContainEqual({
      claim: "Kubernetes",
      evidence: "not found",
      source: "not_found",
    })
    expect(bound.score).toBe(79)
    expect(bound.recommendation).toBe("possible_fit")
  })

  it("overwrites contradictory model-authored portfolio data", () => {
    const bound = bindToolResultsToReport(
      report(),
      { ...proposalResult, score: 0 },
      null,
      ["TypeScript"]
    )

    expect(bound.score).toBe(85)
    expect(bound.portfolioEvidence.findings).toEqual([])
    expect(bound.portfolioEvidence.score).toBe(0)
    expect(bound.scoring).not.toHaveProperty("portfolioRelevance")
  })
})
