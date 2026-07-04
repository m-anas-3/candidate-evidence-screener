import { describe, expect, it } from "vitest"

import { candidateInputSchema } from "@/lib/intake/validation"

const candidate = {
  candidateId: "d73d4c78-5b46-4db7-b3b8-4c11515e06f2",
  jobId: "c84df109-51ef-4ead-9c90-a86d9f948e7d",
  name: "Jordan Lee",
  proposalText: "Relevant proposal evidence.",
  resumePath:
    "9d947eab-a155-4db2-b399-83ea70e6be6b/d73d4c78-5b46-4db7-b3b8-4c11515e06f2/resume.pdf",
}

describe("optional portfolio validation", () => {
  it.each(["", "   ", null])("normalizes %p to null", (portfolioUrl) => {
    expect(
      candidateInputSchema.parse({ ...candidate, portfolioUrl }).portfolioUrl
    ).toBeNull()
  })

  it("preserves a valid public URL", () => {
    expect(
      candidateInputSchema.parse({
        ...candidate,
        portfolioUrl: "https://example.com/work",
      }).portfolioUrl
    ).toBe("https://example.com/work")
  })
})
