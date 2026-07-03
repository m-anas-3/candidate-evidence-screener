function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function mentionsSkill(text: string, skill: string) {
  const normalizedText = text.normalize("NFKC")
  const normalizedSkill = skill.normalize("NFKC").trim()

  if (!normalizedSkill) return false

  const skillPattern = escapeRegularExpression(normalizedSkill).replace(
    /\s+/g,
    "\\s+"
  )
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${skillPattern}(?=$|[^\\p{L}\\p{N}])`,
    "iu"
  ).test(normalizedText)
}
