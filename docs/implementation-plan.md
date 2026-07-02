# MVP Implementation Plan

## Planning Baseline

This plan implements the locked scope in `docs/product-spec.md`, including the replacement of anonymous sessions with email/password authentication. At the time of this audit, the repository contains a starter Next.js page, theme support, and one button primitive. No product data model, authentication, upload flow, agent, or tests exist.

No milestone may add a pipeline, interview-question generation, or another explicit exclusion from the product specification.

## Dependency and Infrastructure Status

| Area | Current status | Planned addition or setup |
| --- | --- | --- |
| Web application | Installed: Next.js 16.2.6, React 19.2.4, TypeScript 5 | Keep App Router and deploy frontend/server together to Vercel |
| UI | Installed: Tailwind CSS 4, shadcn/Radix-related packages, Tabler icons | Add only primitives needed by the workflow |
| Supabase SDK | **Installed foundation** | `@supabase/supabase-js` 2.110.0 and `@supabase/ssr` 0.12.0; schema-dependent use follows |
| Validation | **Installed foundation** | `zod` 4.4.3; shared input and strict report schemas follow in later milestones |
| Resume parsing | **Not installed** | `pdf-parse`, after checking its installed-version API |
| Agent/model | **Not installed** | `deepagents`, `langchain`, `@langchain/core`, `@langchain/openai` |
| Automated tests | **Not installed/configured** | Vitest in Milestone 11; add browser testing only if later acceptance needs it |
| Supabase project | **Schema applied remotely** | MVP tables, RLS, and private `resumes` bucket are migrated; auth-flow and cross-user tests remain |
| OpenAI | **Not configured** | Server-only `OPENAI_API_KEY`; `OPENAI_MODEL=gpt-5.5` with medium reasoning initially |
| Vercel | **Not configured or verified** | Start on Hobby with Fluid Compute; Node Route Handler and 300-second analysis `maxDuration` |

Dependencies are added only in the milestone that first uses them. Package changes use pnpm and include `pnpm-lock.yaml`.

## Challenge and Locked-Requirement Mapping

| Requirement | Planned implementation | Milestones | Verification evidence |
| --- | --- | --- | --- |
| Screen freelance candidates using job, resume, proposal, and one portfolio URL | Persist all four evidence sources and present one candidate report | 2, 4, 5, 8 | End-to-end manual and synthetic candidate acceptance tests |
| Use the JavaScript Deep Agent, not a plain completion | Server-only `createDeepAgent()` harness with constrained, typed tools | 6, 7 | Build/type checks plus an integration run showing tool use and a saved validated report |
| Provide custom tools | Authorized context load, proposal-specificity assessment, safe portfolio inspection, and report persistence | 6 | Unit tests for schemas/tool guards and tool-level failure cases |
| Run on the required application architecture | Next.js Node Route Handlers on Vercel; no Edge Function, Python, or separate agent service | 5–7, 9, 10 | Runtime declarations, production build, and deployed smoke test |
| Use Supabase for auth, data, and private files | Email/password Auth, RLS-protected PostgreSQL tables, direct private Storage upload | 1–5 | Auth flow, fresh-project migration, RLS/ownership tests, upload and refresh test |
| Produce evidence-backed advisory output | Strict report schema, source labels, `not found`, human-review language, no protected-trait inference | 6–8 | Schema fixtures and report acceptance review |
| Analyze proposal specificity responsibly | Report observable specificity/template signals without AI-authorship claims | 6, 8 | Unit fixtures and wording review |
| Support grounded follow-up questions | Protected, bounded, persisted candidate chat using read-only tools | 9 | Refresh persistence and unsupported-question tests |
| Be immediately evaluable | Basic authentication followed by a synthetic sample workflow without real personal data | 3, 10 | Newly signed-in user reaches a meaningful report workflow in under one minute after authentication |
| Meet security and reliability expectations | RLS, server ownership checks, SSRF controls, safe errors, duplicate-run prevention, and focused tests | 2, 4–7, 9, 11 | Security test matrix and final quality gate |
| Preserve locked exclusions | No pipeline, interview questions, multiple URLs, email sending, or other excluded services | All | Scope review in every milestone and final acceptance review |

## Ordered Milestones

### 1. Supabase and Environment Foundation

**Status:** complete. Browser/server clients, the Next.js 16 session-refresh Proxy, required environment names, and dependency lockfile changes are present. Live connectivity remains pending project credentials.

**Depends on:** current Next.js application and relevant installed Next.js 16 guidance.

Add the browser/server Supabase clients, Zod, environment-name documentation, and the current Next.js session-refresh pattern. Use server sessions and RLS for normal access. Do not add a service-role key without a specific administrative requirement that cannot use RLS.

**Gate:** a browser and server client compile; secrets remain server-only; required environment names are documented; lint, typecheck, and build pass.

### 2. Database, RLS, and Private Storage

**Status:** migration `20260701160000` was applied to the linked project on 2026-07-02, and local/remote migration history matches. Same-owner and cross-owner behavior remains to be exercised after the authentication flow exists.

**Depends on:** Milestone 1 and a local or explicitly authorized Supabase environment.

Create migrations for recruiter-owned jobs, candidates, screening reports, and candidate chat messages. Include constraints, indexes, timestamps, ownership-aware RLS, and a private `resumes` bucket whose object paths are scoped to the authenticated user. Store stable fields relationally and flexible report/evidence data selectively as JSONB.

**Gate:** migrations apply to a fresh local project; same-owner access succeeds; cross-owner table and object access fails; no permanent public resume URL exists.

### 3. Email/Password Authentication and App Shell

**Depends on:** Milestones 1–2 and Supabase email/password auth configured.

Build basic sign-up, sign-in, and sign-out plus the accessible jobs/candidates shell. Redirect unauthenticated visitors away from protected product routes. Include validation, pending, authentication failure, loading, empty, and retry states without adding social login, teams, roles, invitations, or a pipeline.

**Gate:** a user can sign up, sign in, sign out, and cannot load protected product routes while signed out; server operations resolve the authenticated user ID; the shell passes keyboard/responsive checks plus lint, typecheck, and build.

### 4. Job and Candidate Intake

**Depends on:** Milestones 2–3.

Implement job fields and candidate fields for name, proposal, one portfolio URL, and one PDF. Upload directly from the authenticated browser to private Storage using an ownership-safe path; persist only the path. Enforce shared validation, PDF-only input, and the 2 MB maximum.

**Gate:** create, refresh, and retrieve a job/candidate; valid upload succeeds; invalid, oversized, missing, and unauthorized inputs fail clearly; PDF bytes do not traverse a Route Handler.

### 5. Resume Text Extraction

**Depends on:** Milestone 4 and the selected `pdf-parse` version.

Add a server-only extractor and protected Node Route Handler. Revalidate candidate ownership, object size, and PDF magic bytes; normalize and persist extracted text and status. Reject corrupt, protected, empty, and image-only PDFs with recoverable errors. Do not add OCR or send PDF bytes to OpenAI.

**Gate:** representative text PDFs extract successfully; every failure leaves a non-success status; parser resources are released; lint, typecheck, and build pass.

### 6. Deep Agent, Prompt, Report Schema, and Tools

**Depends on:** Milestones 1–2 and 5; Deep Agents/LangChain/OpenAI packages and model configuration.

Create a server-only `createDeepAgent()` harness using `gpt-5.5` with medium reasoning initially, a versioned recruiter prompt, strict report schema, and the four locked custom tools. Encode the locked 50/20/15/15 scoring weights, recommendation bands, zero-for-unsupported rule, and 79-point cap when a must-have lacks evidence. Enforce ownership in context loading and saving. Portfolio inspection must allow only public HTTP(S), revalidate every redirect, block private/reserved destinations, and cap time, bytes, and accepted content types. Treat fetched text as hostile evidence, not instructions.

**Gate:** tool schemas and report schema compile; invalid reports cannot persist; unsafe URLs and redirects fail; claims require source evidence or `not found`; the agent has no shell, arbitrary filesystem, or unrestricted mutation tools.

### 7. Candidate Analysis Route Handler

**Depends on:** Milestone 6 and a Vercel Hobby project with Fluid Compute verified.

Add the protected Node Route Handler with `runtime = "nodejs"` and a 300-second `maxDuration`. It validates `candidate_id`, verifies session ownership and extracted text, prevents concurrent duplicate runs, transitions status, invokes the Deep Agent, and returns typed safe results. Persist validated report and run metadata; persist a recoverable failure without leaking internals. Use shorter internal timeouts for portfolio and model operations so failures can be recorded before the function deadline.

**Gate:** a real integration run uses the custom tools and saves one valid report; duplicate and unauthorized requests fail; status transitions recover from tool/model errors; build succeeds with the selected runtime and duration settings.

### 8. Evidence-Backed Report Experience

**Depends on:** Milestone 7.

Add analysis controls and the persisted report view. Display every locked report field with source labels, `not found` states, human-review language, retry behavior, and editable/copyable outreach or rejection text. Do not render fabricated placeholder analysis, interview questions, charts, or pipeline UI.

**Gate:** create candidate → extract → analyze → view report works and survives refresh; loading/error/success states are accessible and comprehensible; report wording passes the advisory/evidence review.

### 9. Grounded Follow-Up Chat

**Depends on:** a completed report from Milestone 8.

Add a protected Node Route Handler and focused chat panel. Load authorized bounded context and recent history, invoke the agent in read-only follow-up mode, and persist user/assistant messages. Unsupported answers distinguish inference from evidence and use `not found` when needed.

**Gate:** evidence questions receive grounded answers, history survives refresh, cross-user access fails, context remains bounded, and chat cannot overwrite reports or mutate unrelated records.

### 10. Synthetic Evaluator Path and Deployment Polish

**Depends on:** Milestones 3–9.

Add a one-click synthetic job/candidate/proposal, locally hosted portfolio fixture, extracted text, and report-ready path for the signed-in user. Keep manual upload available. Add concise privacy/advisory copy and finish responsive, contrast, keyboard, loading, empty, and failure behavior. Configure the Vercel Hobby environment with Fluid Compute and verify Node runtime constraints.

**Gate:** a newly signed-in user reaches a meaningful report workflow in under one minute after authentication without additional credentials or real personal data; the manual path still works; deployed smoke tests pass.

### 11. Automated Tests and Final Security Review

**Depends on:** all behavior milestones.

Add Vitest and focused coverage for the report schema, score/recommendation boundaries, proposal signals, portfolio URL/redirect validation, authentication/ownership, and analysis status transitions. Use fixtures for malformed model output, dead/unsafe portfolio targets, empty resume text, signed-out requests, and cross-user access; do not make paid model calls in automated tests. Add Playwright only if automated browser coverage is required later; keep async Server Component acceptance coverage manual or end-to-end rather than forcing it into Vitest.

Review RLS, defense-in-depth ownership, SSRF, secret/log exposure, duplicate analysis, partial failures, accessibility, and user-visible errors. Record remaining limitations.

**Gate:** `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `git diff --check` pass; the locked-scope checklist and deployed end-to-end smoke test pass.

## Key Risks and Mitigations

| Risk | Impact | Mitigation and gate |
| --- | --- | --- |
| Agent duration exceeds Vercel limits | Analysis times out after partial work | Use Hobby Fluid Compute with a 300-second route limit, shorter internal timeouts, recoverable statuses, and deployed duration tests |
| Portfolio fetching enables SSRF or prompt injection | Internal network exposure or manipulated output | Resolve and block private/reserved IPs, revalidate redirects, cap fetches, accept narrow content types, and delimit fetched text as untrusted evidence |
| RLS or path-policy mistake exposes candidate data | Cross-user data or resume disclosure | Owner-derived policies, private bucket paths, server ownership checks, and negative integration tests |
| PDF parser/runtime incompatibility | Resume extraction fails in production | Verify the installed parser API, force Node runtime, use representative fixtures, and release resources on all paths |
| Model output is malformed or unsupported | Misleading or partially stored report | Strict Zod validation, evidence requirements, no partial persistence, safe failure status, and malformed-output fixtures |
| Duplicate analysis causes conflicting reports or cost | Inconsistent state and unnecessary API spend | Atomic processing transition/idempotency strategy and concurrent-request tests before UI release |
| Public sign-up is abused or mistaken for invite-only access | Unexpected accounts or resource consumption | State that sign-up is public, apply provider rate limits and email verification as configured, protect every product route, and monitor usage |
| Model or package APIs change | Build/runtime drift | Pin through the lockfile, inspect installed-version docs at each integration milestone, and run all quality gates |

## Locked Implementation Defaults

- **Model:** `gpt-5.5` with medium reasoning initially; benchmark representative candidates before changing model or effort.
- **Scoring:** 50 points for job requirements/skills, 20 for relevant experience evidence, 15 for proposal specificity, and 15 for portfolio relevance. Strong Fit is 80–100, Possible Fit is 60–79, and Weak Fit is 0–59. Unsupported criteria score zero, and a missing must-have caps the score at 79.
- **Vercel:** begin on Hobby with Fluid Compute and use a 300-second maximum for the analysis Node Route Handler, with shorter internal timeouts.
- **Tests:** Vitest is the unit/integration runner. Browser automation remains deferred unless an acceptance gap requires Playwright.
- **Authentication:** use basic Supabase email/password sign-up, sign-in, and sign-out. Product routes require a valid session, RLS isolates recruiter data, and account data persists. Public sign-up is not invite-only access.

Revalidate model availability, package compatibility, and provider limits when their milestones begin because those external capabilities may change. Such changes may refine implementation details but must not change the locked product flow, report fields, evidence rules, or exclusions.
