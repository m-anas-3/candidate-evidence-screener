import {
  proposalSpecificitySchema,
  type ProposalSpecificity,
} from "./report-schema"
import { mentionsSkill } from "./skill-matching"

const GENERIC_PHRASES = [
  "dear hiring manager",
  "i am writing to apply",
  "i am the perfect candidate",
  "i can do this job",
  "looking forward to hearing",
]

export function assessProposalSpecificity(
  proposalText: string,
  jobTitle: string,
  mustHaveSkills: string[]
): ProposalSpecificity {
  const normalized = proposalText.toLowerCase()
  const specificSignals: string[] = []
  const templateSignals: string[] = []
  let score = 0

  if (normalized.includes(jobTitle.toLowerCase())) {
    score += 4
    specificSignals.push("Names the job title.")
  }

  const mentionedSkills = mustHaveSkills.filter((skill) =>
    mentionsSkill(proposalText, skill)
  )
  if (mentionedSkills.length > 0) {
    score += Math.min(6, mentionedSkills.length * 2)
    specificSignals.push(
      `References required skills: ${mentionedSkills.join(", ")}.`
    )
  }

  if (
    /\b\d+(?:\.\d+)?\s*(?:%|years?|months?|weeks?|projects?)\b/i.test(
      proposalText
    )
  ) {
    score += 3
    specificSignals.push("Includes a concrete quantity, duration, or result.")
  }

  if (proposalText.length >= 300) {
    score += 2
    specificSignals.push("Provides substantive job-facing detail.")
  }

  for (const phrase of GENERIC_PHRASES) {
    if (normalized.includes(phrase)) {
      templateSignals.push(`Uses generic phrase: “${phrase}”.`)
    }
  }

  if (specificSignals.length === 0) {
    templateSignals.push(
      "No job title, required skill, or concrete result was identified."
    )
  }

  return proposalSpecificitySchema.parse({
    // score may exceed 15 during accumulation (e.g. all signals fire together).
    // Math.min clamps it to the 0–15 schema maximum. The intermediate value is
    // intentionally not capped earlier so each signal's contribution remains
    // clearly readable above.
    score: Math.min(score, 15),
    specificSignals,
    templateSignals,
    evidence: [
      {
        claim: "Observable proposal specificity",
        evidence:
          specificSignals.length > 0 ? specificSignals.join(" ") : "not found",
        source: specificSignals.length > 0 ? "proposal" : "not_found",
      },
    ],
    summary:
      specificSignals.length > 0
        ? `The proposal contains ${specificSignals.length} observable specificity signal(s) and ${templateSignals.length} generic/template signal(s).`
        : "Job-specific proposal evidence was not found; this does not indicate who or what authored the proposal.",
  })
}
