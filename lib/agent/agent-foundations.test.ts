import { describe, expect, it } from "vitest"

import { assessProposalSpecificity } from "@/lib/agent/proposal-specificity"
import { screeningReportSchema } from "@/lib/agent/report-schema"

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
