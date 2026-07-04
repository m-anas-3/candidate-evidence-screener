import { expect, it } from "vitest"

import { screeningReportSchema } from "@/lib/agent/report-schema"
import { validateReportMustHaveCoverage } from "@/lib/agent/report-validation"

function highScoringReport(missingSkill: string) {
  return screeningReportSchema.parse({
    scoring: {
      jobRequirementsAndSkills: 55,
      relevantExperience: 30,
      proposalSpecificity: 15,
    },
    summary: "Summary.",
    strengths: [],
    weaknesses: [],
    matchedSkills: [],
    missingSkills: [
      { claim: missingSkill, evidence: "not found", source: "not_found" },
    ],
    proposalSpecificityFindings: {
      score: 15,
      specificSignals: [],
      templateSignals: [],
      evidence: [],
      summary: "Summary.",
    },
    reviewPoints: [],
    outreachMessage: "Draft.",
  })
}

it("caps the score when a declared must-have is missing", () => {
  const report = highScoringReport("GraphQL")

  const validated = validateReportMustHaveCoverage(report, ["TypeScript"])

  expect(validated.score).toBe(79)
  expect(validated.missingSkills).toContainEqual({
    claim: "TypeScript",
    evidence: "not found",
    source: "not_found",
  })
})

it("does not cap the score when only an optional skill is missing", () => {
  const report = highScoringReport("GraphQL")

  const validated = validateReportMustHaveCoverage(report, [])

  expect(validated.score).toBe(100)
  expect(validated.recommendation).toBe("strong_fit")
})

it("removes a contradictory missing must-have when supported evidence exists", () => {
  const report = screeningReportSchema.parse({
    scoring: {
      jobRequirementsAndSkills: 40,
      relevantExperience: 20,
      proposalSpecificity: 10,
      portfolioRelevance: 10,
    },
    summary: "Summary.",
    strengths: [],
    weaknesses: [],
    matchedSkills: [
      {
        claim: "React",
        evidence: "Built React applications.",
        source: "resume",
      },
    ],
    missingSkills: [
      { claim: "React", evidence: "not found", source: "not_found" },
    ],
    proposalSpecificityFindings: {
      score: 10,
      specificSignals: [],
      templateSignals: [],
      evidence: [],
      summary: "Summary.",
    },
    portfolioEvidence: {
      score: 10,
      inspectedUrl: "https://example.com/",
      status: "inspected",
      findings: [],
      summary: "Summary.",
    },
    reviewPoints: [],
    outreachMessage: "Draft.",
  })

  const repaired = validateReportMustHaveCoverage(report, ["React"])
  expect(repaired.missingSkills).toEqual([])
  expect(repaired.score).toBe(80)
  expect(repaired.recommendation).toBe("strong_fit")
})
