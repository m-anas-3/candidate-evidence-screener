# Candidate Evidence Screener

A recruiter-facing application that helps verify a freelancer's claims against
a specific role. It extracts text from a private PDF resume, compares the
resume and proposal with the role requirements, and produces a structured,
evidence-backed report for human review. Recruiters can then ask follow-up
questions grounded in the submitted material.

All scores and recommendations are advisory. See the
[product specification](docs/product-spec.md) for the authoritative product
scope, scoring rules, security requirements, and exclusions.

## Features

- Email and password authentication with recruiter-owned data
- Job intake with requirements and explicit must-have skills
- Candidate intake with proposal text, one PDF resume, and an optional
  portfolio URL
- Private resume storage and server-side text extraction
- Evidence-backed candidate analysis with validated structured output
- Manual portfolio review without portfolio scoring
- Persisted screening reports and grounded recruiter chat
- Persistent per-recruiter rate limits and bounded AI inputs
- Synthetic sample data for evaluating the complete workflow
- Public, data-free portfolio case study at `/case-study`

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS and shadcn/ui
- Supabase Authentication, PostgreSQL, Row Level Security, and private Storage
- OpenAI through LangChain and Deep Agents
- Zod, Vitest, ESLint, and Prettier

## Prerequisites

- Node.js 20.9 or newer
- pnpm 10
- A Supabase project, or Docker and the Supabase CLI for local development
- An OpenAI API key for candidate analysis and recruiter chat

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Configure `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   OPENAI_API_KEY=
   OPENAI_ANALYSIS_MODEL=gpt-5.4
   OPENAI_CHAT_MODEL=gpt-5.4-mini
   ```

   The Supabase values and `OPENAI_API_KEY` are required. The application
   defaults to `gpt-5.4` for analysis and `gpt-5.4-mini` for grounded chat;
   either model can be overridden. Never expose server-side API keys through a
   `NEXT_PUBLIC_` variable.

4. Apply the Supabase migrations. For a local Supabase instance with Docker
   running:

   ```bash
   supabase start
   supabase db reset
   ```

   See [supabase/README.md](supabase/README.md) for local validation, type
   generation, remote linking, and deployment instructions.

5. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command          | Purpose                         |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start the development server    |
| `pnpm build`     | Create a production build       |
| `pnpm start`     | Serve a production build        |
| `pnpm test`      | Run the Vitest suite            |
| `pnpm lint`      | Run ESLint                      |
| `pnpm typecheck` | Run strict TypeScript checks    |
| `pnpm format`    | Format TypeScript and TSX files |

Before submitting changes, run:

```bash
pnpm exec prettier --check "**/*.{ts,tsx}"
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Portfolio demo notes

The public `/case-study` page explains the recruiting problem, product
workflow, safeguards, and technical design using a synthetic report state. It
does not require an account and contains no real candidate or client data.

For a hands-on evaluation, create a workspace and use the synthetic sample from
the dashboard. That path seeds fictional extracted resume text and exercises
persisted job and candidate records, structured analysis, report presentation,
and grounded chat without asking a reviewer to upload personal information. AI
analysis still requires configured server-side OpenAI credentials.

This portfolio build demonstrates Next.js 16 App Router boundaries, Supabase
Auth and Row Level Security, private resume storage, server-side PDF extraction,
strict Zod validation for structured AI output, persistent rate limits,
grounded follow-up chat, and focused Vitest coverage. It remains a decision
support tool: recommendations are advisory and recruiter review is required.

## Repository structure

```text
app/                 Pages, layouts, Server Actions, and Route Handlers
components/          Shared components and shadcn/ui primitives
hooks/               Reusable React hooks
lib/                 Agent, Supabase, intake, query, and resume helpers
public/              Static assets
supabase/            Database migrations and local Supabase configuration
docs/product-spec.md Product behavior, scoring, security, and scope
```

## Security notes

- Keep secrets in `.env.local` and never commit credentials.
- Keep the Supabase `resumes` bucket private.
- Preserve Row Level Security and server-side ownership checks.
- Never expose service-role or OpenAI keys to browser code.
- Do not send PDF bytes to OpenAI; only extracted text is analyzed.
- AI routes reject oversized input before contacting the model. Chat messages
  are limited to 2,000 characters; analysis is limited to 60,000 resume
  characters and 80,000 combined context characters.
- Persistent per-recruiter limits allow 20 chat requests per 5 minutes and 15
  candidate analyses per hour. Apply all Supabase migrations before running
  the application so these limits fail safely rather than being bypassed.
