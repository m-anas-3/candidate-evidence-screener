# Freelance Candidate Evidence Screener

A recruiter-facing application for evaluating a freelance candidate against a
specific role using documented resume and proposal evidence. The application
produces a structured screening report, keeps portfolio review manual, and
supports grounded follow-up questions.

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
- Synthetic sample data for evaluating the complete workflow

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
   OPENAI_ANALYSIS_MODEL=
   OPENAI_CHAT_MODEL=
   ```

   The Supabase values and `OPENAI_API_KEY` are required. Model overrides are
   optional; leaving them blank uses the application defaults. Never expose
   server-side API keys through a `NEXT_PUBLIC_` variable.

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

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve a production build |
| `pnpm test` | Run the Vitest suite |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run strict TypeScript checks |
| `pnpm format` | Format TypeScript and TSX files |

Before submitting changes, run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

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
