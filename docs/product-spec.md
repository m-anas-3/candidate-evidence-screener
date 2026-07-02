# Freelance Candidate Evidence Screener — MVP Specification

## Status

This is the implementation contract for the current locked MVP and supersedes the earlier anonymous-session plan. Supabase persistence, authentication, job/candidate intake, and resume extraction are implemented. Agent analysis, reports, chat, synthetic evaluation data, deployment verification, and automated tests remain planned.

## Product and Core Flow

The product helps a recruiter review evidence for one freelance candidate against one job. A recruiter must be able to:

1. Create a job with its description, requirements, and must-have skills.
2. Add a candidate with a proposal, one public portfolio URL, and one PDF resume.
3. Extract and persist resume text.
4. Analyze the job, resume, proposal, and portfolio evidence.
5. Review a validated, evidence-backed screening report.
6. Ask grounded follow-up questions about the completed report and source material.

The report contains a score, recommendation, summary, strengths, weaknesses, matched and missing skills, proposal-specificity findings, portfolio evidence, review points, and an editable outreach or rejection message. It does not contain generated interview questions.

All hiring output is advisory. Claims must cite resume, proposal, or portfolio evidence, or state `not found`. Proposal analysis may identify observable template and specificity signals but must not claim to detect or prove AI authorship. The product must not infer protected characteristics.

Use this locked scoring rubric:

- Job requirements and skills: 50 points.
- Relevant experience evidence: 20 points.
- Proposal specificity: 15 points.
- Portfolio relevance: 15 points.
- 80–100: Strong Fit; 60–79: Possible Fit; 0–59: Weak Fit.

An unsupported criterion scores zero rather than being inferred. If any explicitly declared must-have skill lacks supporting evidence, cap the total at 79 so the recommendation cannot be Strong Fit. The score measures documented evidence against the job, not a person's intrinsic quality or an automatic hiring decision.

## Architecture

- **Application:** Next.js 16 App Router, with frontend and server code deployed together on Vercel.
- **Agent runtime:** the JavaScript `deepagents` package and `createDeepAgent()` run server-side in a protected Next.js Node.js Route Handler on Vercel. There is no Python or separate agent service.
- **Model:** OpenAI `gpt-5.5`, configured as `OPENAI_MODEL=gpt-5.5` with medium reasoning as the initial setting. Confirm access and installed-adapter support during agent implementation.
- **Authentication:** basic Supabase email/password sign-up, sign-in, and sign-out. For the one-week MVP, Supabase email confirmation is disabled so sign-up returns a session immediately. This does not verify ownership of the submitted email address. Product routes still require an authenticated account, and public self-service sign-up does not make the product invite-only.
- **Persistence:** Supabase PostgreSQL stores jobs, candidates, reports, and chat messages, and private Supabase Storage stores resumes.
- **Uploads:** the authenticated browser uploads PDFs directly to private Storage, so upload bytes do not pass through a Vercel Route Handler. The protected extraction handler later downloads the private object by its stored path; PDF bytes are never sent to OpenAI.
- **Server boundaries:** Server Actions may handle ordinary form mutations. Protected Node Route Handlers handle resume extraction, agent analysis, and follow-up chat. Every entry point validates input, authenticates the session, and verifies resource ownership.

The Deep Agent has only four product tools:

1. Load authorized job and candidate context.
2. Assess observable proposal-specificity signals.
3. Inspect one public portfolio URL with SSRF, redirect, timeout, content-type, and size controls.
4. Validate and save the screening report.

Follow-up chat reuses the agent in a read-only mode and cannot overwrite the report.

## Data and Security Rules

Use typed relational columns for stable fields and JSONB only for flexible report arrays, evidence, and raw structured model output. Enable Row Level Security on every exposed table, scope private resume objects to the owning user, and repeat ownership checks in server operations.

Accept PDF files only, with a 2 MB maximum. Validate declared type, PDF magic bytes, ownership, and extracted content. Scanned/image-only PDFs are unsupported in the MVP; do not add OCR. Never send PDF bytes to the model.

Structured agent output must pass a strict Zod schema before persistence. Invalid or partial output must fail safely. Prevent concurrent duplicate analysis, persist recoverable status transitions, bound chat history, treat portfolio content as untrusted input, and do not expose server secrets or model internals.

Authenticated account data persists until a future explicit deletion feature or administrator action. Automatic retention cleanup and account administration are not part of this MVP. Never use a service-role key in ordinary product requests or expose it to client code.

## User Experience and Completion

Use accessible shadcn/ui patterns with clear validation, pending, disabled, empty, success, failure, and retry states. A visitor must authenticate before entering the product. After authentication, an evaluator can try a fully synthetic sample candidate without additional credentials or real personal data.

The MVP is complete when the manual upload flow and the synthetic sample flow both reach a persisted report, follow-up answers remain grounded after refresh, cross-user access is rejected, and the documented quality gates pass.

## Explicit Exclusions

The MVP excludes a pipeline board or candidate-stage workflow, interview-question generation, multiple portfolio URLs, social login, teams, roles, invitations, account administration, payments, email sending, LinkedIn scraping, OCR, protected-characteristic inference, Supabase Edge Functions, Python, a separate agent service, general-purpose chat, and automatic hiring decisions.

## Current Repository Status

Installed today: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/Radix-related UI packages, Supabase browser/server clients, Zod, `pdf-parse` 2.4.5, ESLint, and Prettier. The linked project has the MVP schema, RLS policies, and private `resumes` bucket. Immediate email/password authentication, protected dashboard routes, job/candidate intake, direct private PDF upload, and protected resume text extraction are implemented.

Not installed yet: `deepagents`, LangChain packages, the OpenAI LangChain adapter, and Vitest. Not provisioned or verified yet: a live immediate sign-up/intake/extraction test, cross-user RLS acceptance tests, OpenAI credentials/model access, and a Vercel Hobby deployment with Fluid Compute. These are planned dependencies or verification work, not current capabilities.
