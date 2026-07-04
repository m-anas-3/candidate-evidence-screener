import { describe, expect, it } from "vitest"

import { isPrivateOrReservedAddress } from "@/lib/agent/portfolio-security"
import { assessProposalSpecificity } from "@/lib/agent/proposal-specificity"
import { screeningReportSchema } from "@/lib/agent/report-schema"

function reportWithTotal(total: 59 | 60 | 79 | 80) {
  const proposalScore = total >= 15 ? 15 : total
  const remainingAfterProposal = total - proposalScore
  const portfolioScore = Math.min(15, remainingAfterProposal)
  const remaining = remainingAfterProposal - portfolioScore
  const experienceScore = Math.min(20, remaining)
  const requirementsScore = remaining - experienceScore

  return screeningReportSchema.parse({
    scoring: {
      jobRequirementsAndSkills: requirementsScore,
      relevantExperience: experienceScore,
      proposalSpecificity: proposalScore,
      portfolioRelevance: portfolioScore,
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
    portfolioEvidence: {
      score: portfolioScore,
      inspectedUrl: "https://example.com/",
      status: "inspected",
      findings: [],
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

describe("portfolio address controls", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "192.168.1.1",
    "::1",
    "fc00::1",
    "2001:db8::1",
    "not-an-ip",
  ])("blocks private or reserved address %s", (address) => {
    expect(isPrivateOrReservedAddress(address)).toBe(true)
  })

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])(
    "allows public address %s",
    (address) => {
      expect(isPrivateOrReservedAddress(address)).toBe(false)
    }
  )
})
