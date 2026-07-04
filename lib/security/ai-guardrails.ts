import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import type { Database } from "@/lib/supabase/database.types"

export const MAX_CHAT_MESSAGE_CHARACTERS = 2_000
export const MAX_CHAT_HISTORY_CHARACTERS = 24_000
export const MAX_ANALYSIS_CONTEXT_CHARACTERS = 80_000
export const MAX_ANALYSIS_RESUME_CHARACTERS = 60_000

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(
      MAX_CHAT_MESSAGE_CHARACTERS,
      `Message is too long. Remove some text and keep it under ${MAX_CHAT_MESSAGE_CHARACTERS.toLocaleString()} characters.`
    ),
})

export type AiRateLimitKind = "candidate_analysis" | "candidate_chat"

type ChatHistoryMessage = {
  content: string
  role: string
}

export function boundChatHistory(
  newestFirst: ChatHistoryMessage[]
): ChatHistoryMessage[] {
  const bounded: ChatHistoryMessage[] = []
  let remainingCharacters = MAX_CHAT_HISTORY_CHARACTERS

  for (const message of newestFirst) {
    if (remainingCharacters === 0) break

    const content = message.content.slice(0, remainingCharacters)
    bounded.push({ ...message, content })
    remainingCharacters -= content.length
  }

  return bounded.reverse()
}

type AnalysisContext = {
  description: string
  mustHaveSkills: string[]
  proposalText: string
  requirements: string
  resumeText: string
  title: string
}

export function getAnalysisContextLimitError(
  context: AnalysisContext
): string | null {
  if (context.resumeText.length > MAX_ANALYSIS_RESUME_CHARACTERS) {
    return `The extracted resume is too long for safe AI analysis. Upload a shorter resume with no more than ${MAX_ANALYSIS_RESUME_CHARACTERS.toLocaleString()} characters.`
  }

  const totalCharacters =
    context.title.length +
    context.description.length +
    context.requirements.length +
    context.mustHaveSkills.reduce((total, skill) => total + skill.length, 0) +
    context.proposalText.length +
    context.resumeText.length

  if (totalCharacters > MAX_ANALYSIS_CONTEXT_CHARACTERS) {
    return `The job, proposal, and resume contain too much text for safe AI analysis. Remove some text so the combined content is ${MAX_ANALYSIS_CONTEXT_CHARACTERS.toLocaleString()} characters or fewer.`
  }

  return null
}

export type AiRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }
  | { allowed: false; unavailable: true }

export async function consumeAiRateLimit(
  supabase: SupabaseClient<Database>,
  requestKind: AiRateLimitKind
): Promise<AiRateLimitResult> {
  const { data, error } = await supabase.rpc("consume_ai_rate_limit", {
    requested_kind: requestKind,
  })
  const result = data?.[0]

  if (error || !result) {
    console.error("AI rate limit check failed", {
      code: error?.code ?? "missing_result",
      requestKind,
    })
    return { allowed: false, unavailable: true }
  }

  return result.allowed
    ? { allowed: true }
    : {
        allowed: false,
        retryAfterSeconds: Math.max(1, result.retry_after_seconds),
      }
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`

  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? "" : "s"}`
}
