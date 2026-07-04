import { describe, expect, it } from "vitest"
import { z } from "zod"

import { assessProposalSpecificity } from "@/lib/agent/proposal-specificity"
import {
  normalizeModelReportScores,
  screeningReportSchema,
  screeningReportToolInputSchema,
} from "@/lib/agent/report-schema"

function reportWithTotal(total: 59 | 60 | 79 | 80) {
  const proposalScore = total >= 15 ? 15 : total
  const remainingAfterProposal = total - proposalScore
  const experienceScore = Math.min(30, remainingAfterProposal)
  const requirementsScore = remainingAfterProposal - experienceScore

  return screeningReportSchema.parse({
    scoring: {
      jobRequirementsAndSkills: requirementsScore,
      relevantExperience: experienceScore,
      proposalSpecificity: proposalScore,
    },
    summary: "Boundary fixture.",
    strengths: [],
    weaknesses: [],
    matchedSkills: [],
    missingSkills: [],
    proposalSpecificityFindings: {
      score: proposalScore,
      specificSignals: [],
      templateSignals: [],
      evidence: [],
      summary: "Boundary fixture.",
    },
    reviewPoints: [],
    outreachMessage: "Draft.",
  })
}

describe("screening recommendation boundaries", () => {
  it.each([
    [59, "weak_fit"],
    [60, "possible_fit"],
    [79, "possible_fit"],
    [80, "strong_fit"],
  ] as const)("derives %s as %s", (score, recommendation) => {
    expect(reportWithTotal(score)).toMatchObject({ score, recommendation })
  })

  it("normalizes model-authored scores to the rubric bounds", () => {
    const toolInput = screeningReportToolInputSchema.parse({
      score: 140,
      scoring: {
        jobRequirementsAndSkills: 72,
        relevantExperience: 35,
        proposalSpecificity: 21,
      },
      summary: "Bounded score fixture.",
      strengths: [],
      weaknesses: [],
      matchedSkills: [],
      missingSkills: [],
      proposalSpecificityFindings: {
        score: 21,
        specificSignals: [],
        templateSignals: [],
        evidence: [],
        summary: "Bounded score fixture.",
      },
      portfolioEvidence: {
        score: 22,
        inspectedUrl: null,
        status: "manual_review",
        findings: [],
        summary: "Manual review.",
      },
      reviewPoints: [],
      outreachMessage: "Draft.",
    })
    const report = screeningReportSchema.parse(
      normalizeModelReportScores(toolInput)
    )

    expect(report.scoring).toEqual({
      jobRequirementsAndSkills: 55,
      relevantExperience: 30,
      proposalSpecificity: 15,
    })
    expect(report.proposalSpecificityFindings.score).toBe(15)
    expect(report.portfolioEvidence.score).toBe(15)
    expect(report.score).toBe(100)
  })

  it("keeps the agent tool input representable as JSON Schema", () => {
    expect(() => z.toJSONSchema(screeningReportToolInputSchema)).not.toThrow()
  })
})

describe("proposal specificity", () => {
  it("scores observable job-specific signals without authorship claims", () => {
    const result = assessProposalSpecificity(
      "For the Next.js Engineer role, I delivered 4 Next.js projects over 3 years.",
      "Next.js Engineer",
      ["Next.js"]
    )

    expect(result.score).toBeGreaterThan(0)
    expect(result.specificSignals.length).toBeGreaterThan(0)
    expect(result.summary.toLowerCase()).not.toContain("ai-generated")
  })
})
