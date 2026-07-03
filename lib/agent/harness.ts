import "server-only"

import { ChatOpenAI } from "@langchain/openai"
import {
  createDeepAgent,
  registerHarnessProfile,
  StateBackend,
} from "deepagents"
import { z } from "zod"

import { RECRUITER_PROMPT_VERSION, RECRUITER_SYSTEM_PROMPT } from "./prompt"
import { createRecruiterTools } from "./tools"
import type { Database } from "@/lib/supabase/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

const agentEnvironmentSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5.4-mini"),
})

const NON_PRODUCT_TOOLS = [
  "write_todos",
  "ls",
  "read_file",
  "write_file",
  "edit_file",
  "glob",
  "grep",
  "task",
  "execute",
  "start_async_task",
  "check_async_task",
  "list_async_tasks",
  "cancel_async_task",
  "update_async_task",
]

// profileRegistered is module-level state used to ensure the harness profile
// is only registered once per process lifetime. In a long-running Node server
// this persists across requests as expected. In serverless environments
// (e.g. Vercel cold starts) each new function instance starts fresh, so
// registration will re-run on the first request of each cold start — this is
// intentional and correct.
let profileRegistered = false

function registerRestrictedAgentProfile() {
  if (profileRegistered) return

  registerHarnessProfile("openai", {
    excludedTools: NON_PRODUCT_TOOLS,
    generalPurposeSubagent: { enabled: false },
  })
  profileRegistered = true
}

type CandidateAnalysisAgentOptions = {
  candidateId: string
  recruiterId: string
  supabase: SupabaseClient<Database>
}

export function createCandidateAnalysisAgent(
  options: CandidateAnalysisAgentOptions
) {
  // Parse and validate env vars. On failure, Zod includes field values in the
  // error message, so we catch and rethrow with the API key masked to prevent
  // accidental secret exposure in server logs or error tracking.
  let environment: z.infer<typeof agentEnvironmentSchema>
  try {
    environment = agentEnvironmentSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL || undefined,
    })
  } catch (error) {
    // Re-throw a safe error that never includes the raw key value.
    throw new Error(
      `Agent environment configuration is invalid. Ensure OPENAI_API_KEY and OPENAI_MODEL are set correctly. Detail: ${error instanceof Error ? error.message.replace(process.env.OPENAI_API_KEY ?? "", "[REDACTED]") : "unknown"}`
    )
  }
  registerRestrictedAgentProfile()

  const model = new ChatOpenAI({
    apiKey: environment.OPENAI_API_KEY,
    maxRetries: 1,
    model: environment.OPENAI_MODEL,
    reasoning: { effort: "medium" },
    timeout: 240_000,
  })
  const tools = createRecruiterTools({
    ...options,
    modelIdentifier: environment.OPENAI_MODEL,
    promptVersion: RECRUITER_PROMPT_VERSION,
  })

  return createDeepAgent({
    backend: (configuration) => new StateBackend(configuration),
    model,
    name: "recruiter_candidate_screener",
    subagents: [],
    systemPrompt: RECRUITER_SYSTEM_PROMPT,
    tools,
  })
}

export function getCandidateAnalysisPrompt(candidateId: string) {
  return `Analyze candidate ${candidateId}. Use every required product tool in the prescribed order and save exactly one complete screening report.`
}
