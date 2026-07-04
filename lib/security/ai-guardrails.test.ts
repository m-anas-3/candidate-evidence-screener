import { describe, expect, it, vi } from "vitest"

import {
  boundChatHistory,
  chatMessageSchema,
  consumeAiRateLimit,
  formatRetryAfter,
  getAnalysisContextLimitError,
  MAX_ANALYSIS_CONTEXT_CHARACTERS,
  MAX_ANALYSIS_RESUME_CHARACTERS,
  MAX_CHAT_HISTORY_CHARACTERS,
} from "@/lib/security/ai-guardrails"
import type { Database } from "@/lib/supabase/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

const baseContext = {
  description: "Build reliable software.",
  mustHaveSkills: ["TypeScript"],
  proposalText: "I have relevant experience.",
  requirements: "Deliver tested changes.",
  resumeText: "Documented experience.",
  title: "Software Engineer",
}

describe("AI text safety limits", () => {
  it("returns an actionable error for an oversized chat message", () => {
    const result = chatMessageSchema.safeParse({ message: "x".repeat(2_001) })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Remove some text")
    }
  })

  it("accepts analysis context within the configured limits", () => {
    expect(getAnalysisContextLimitError(baseContext)).toBeNull()
  })

  it("rejects an oversized resume with actionable guidance", () => {
    const error = getAnalysisContextLimitError({
      ...baseContext,
      resumeText: "x".repeat(MAX_ANALYSIS_RESUME_CHARACTERS + 1),
    })

    expect(error).toContain("Upload a shorter resume")
    expect(error).toContain(MAX_ANALYSIS_RESUME_CHARACTERS.toLocaleString())
  })

  it("rejects oversized combined analysis context", () => {
    const error = getAnalysisContextLimitError({
      ...baseContext,
      description: "x".repeat(MAX_ANALYSIS_CONTEXT_CHARACTERS),
    })

    expect(error).toContain("Remove some text")
    expect(error).toContain(MAX_ANALYSIS_CONTEXT_CHARACTERS.toLocaleString())
  })

  it("keeps the newest chat history within one character budget", () => {
    const bounded = boundChatHistory([
      { role: "assistant", content: "n".repeat(20_000) },
      { role: "user", content: "o".repeat(20_000) },
    ])

    expect(bounded.map((message) => message.content.length)).toEqual([
      4_000, 20_000,
    ])
    expect(
      bounded.reduce((total, message) => total + message.content.length, 0)
    ).toBe(MAX_CHAT_HISTORY_CHARACTERS)
  })
})

describe("rate-limit retry messages", () => {
  it.each([
    [1, "1 second"],
    [45, "45 seconds"],
    [60, "1 minute"],
    [61, "2 minutes"],
  ] as const)("formats %s seconds as %s", (seconds, expected) => {
    expect(formatRetryAfter(seconds)).toBe(expected)
  })

  it("returns a denied result with the database retry interval", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [{ allowed: false, retry_after_seconds: 37 }],
        error: null,
      }),
    } as unknown as SupabaseClient<Database>

    await expect(
      consumeAiRateLimit(supabase, "candidate_chat")
    ).resolves.toEqual({ allowed: false, retryAfterSeconds: 37 })
  })

  it("fails closed when the persistent limiter is unavailable", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "database_error" },
      }),
    } as unknown as SupabaseClient<Database>

    await expect(
      consumeAiRateLimit(supabase, "candidate_analysis")
    ).resolves.toEqual({ allowed: false, unavailable: true })
    log.mockRestore()
  })
})
