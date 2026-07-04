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
  OPENAI_ANALYSIS_MODEL: z.string().trim().min(1).default("gpt-5.4"),
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

export class CandidateAnalysisAgentConfiguration {
  readonly #apiKey: string
  readonly modelIdentifier: string

  constructor(apiKey: string, modelIdentifier: string) {
    this.#apiKey = apiKey
    this.modelIdentifier = modelIdentifier
  }

  createModel() {
    return new ChatOpenAI({
      apiKey: this.#apiKey,
      maxRetries: 1,
      model: this.modelIdentifier,
      timeout: 240_000,
    })
  }
}

export class AgentConfigurationError extends Error {
  constructor(cause?: unknown) {
    super("Agent environment configuration is invalid.")
    this.name = "AgentConfigurationError"
    if (cause !== undefined) {
      // Preserves the original Zod error for anyone inspecting the error
      // chain (e.g. in Sentry) without exposing raw env values in the
      // top-level message that gets shown to callers/logs by default.
      this.cause = cause
    }
  }
}

export function getCandidateAnalysisAgentConfiguration(): CandidateAnalysisAgentConfiguration {
  const result = agentEnvironmentSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ANALYSIS_MODEL: process.env.OPENAI_ANALYSIS_MODEL || undefined,
  })

  if (!result.success) {
    // Zod's flatten() reports issues per-field (e.g. "Required",
    // "String must contain at least 1 character(s)") without echoing back
    // the actual secret value, so this is safe to log server-side.
    console.error(
      "[recruiter-agent] Agent environment configuration failed validation:",
      JSON.stringify(result.error.flatten(), null, 2)
    )
    throw new AgentConfigurationError(result.error)
  }

  return new CandidateAnalysisAgentConfiguration(
    result.data.OPENAI_API_KEY,
    result.data.OPENAI_ANALYSIS_MODEL
  )
}

export function createCandidateAnalysisAgent(
  options: CandidateAnalysisAgentOptions,
  configuration = getCandidateAnalysisAgentConfiguration()
) {
  registerRestrictedAgentProfile()

  const model = configuration.createModel()
  const tools = createRecruiterTools({
    ...options,
    modelIdentifier: configuration.modelIdentifier,
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
