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
      jobRequirementsAndSkills: 50,
      relevantExperience: 20,
      proposalSpecificity: 15,
      portfolioRelevance: 15,
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
      summary: "Relevant work was found.",
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
      { finalUrl: "https://portfolio.example/work", status: "inspected" },
      ["TypeScript"]
    )

    expect(bound.proposalSpecificityFindings).toEqual(proposalResult)
    expect(bound.scoring.proposalSpecificity).toBe(4)
  })

  it("binds an inspected portfolio status and final URL", () => {
    const bound = bindToolResultsToReport(
      report(),
      proposalResult,
      { finalUrl: "https://portfolio.example/final", status: "inspected" },
      ["TypeScript"]
    )

    expect(bound.portfolioEvidence.inspectedUrl).toBe(
      "https://portfolio.example/final"
    )
    expect(bound.portfolioEvidence.status).toBe("inspected")
  })

  it.each([
    ["unavailable", "source was unavailable"],
    ["unsafe", "blocked for safety"],
    ["not_provided", "was not provided"],
  ] as const)("zeroes and clears %s portfolio evidence", (status, summary) => {
    const bound = bindToolResultsToReport(
      report(),
      proposalResult,
      { finalUrl: null, status },
      ["TypeScript"]
    )

    expect(bound.portfolioEvidence).toMatchObject({
      findings: [],
      inspectedUrl: null,
      score: 0,
      status,
    })
    expect(bound.portfolioEvidence.summary).toContain(summary)
    expect(bound.scoring.portfolioRelevance).toBe(0)
  })

  it("repairs omitted must-haves and derives the capped score", () => {
    const bound = bindToolResultsToReport(
      report(),
      proposalResult,
      { finalUrl: "https://portfolio.example/", status: "inspected" },
      ["TypeScript", "Kubernetes"]
    )

    expect(bound.missingSkills).toContainEqual({
      claim: "Kubernetes",
      evidence: "not found",
      source: "not_found",
    })
    expect(bound.score).toBe(79)
    expect(bound.recommendation).toBe("possible_fit")
  })

  it("overwrites contradictory model tool data and re-derives totals", () => {
    const bound = bindToolResultsToReport(
      report(),
      { ...proposalResult, score: 0 },
      { finalUrl: null, status: "unsafe" },
      ["TypeScript"]
    )

    expect(bound.score).toBe(70)
    expect(bound.recommendation).toBe("possible_fit")
    expect(bound.proposalSpecificityFindings.score).toBe(0)
    expect(bound.portfolioEvidence.score).toBe(0)
  })
})
