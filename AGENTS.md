# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router project. Pages, layouts, and Route Handlers live in `app/`. Shared components belong in `components/`, with shadcn/ui primitives in `components/ui/`. Put reusable hooks in `hooks/`, framework-independent helpers in `lib/`, and static assets in `public/`. Use the `@/` alias instead of long relative imports. Product behavior and planned architecture are documented in `docs/product-spec.md`.

## Build, Test, and Development Commands

Use pnpm and commit changes to `pnpm-lock.yaml` with dependency updates.

- `pnpm dev` starts the local development server.
- `pnpm build` creates the production build.
- `pnpm start` serves an existing production build.
- `pnpm lint` runs the Next.js ESLint configuration.
- `pnpm typecheck` runs strict TypeScript checks without emitting files.
- `pnpm format` formats TypeScript and TSX files with Prettier.
- `npx shadcn@latest add <component>` adds a UI primitive.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, and Prettier formatting. Components use PascalCase exports; functions, variables, and hooks use camelCase, with hooks prefixed by `use`. Name component files in lowercase kebab-case, such as `candidate-card.tsx`. Prefer Server Components. Add `"use client"` only when browser APIs, client state, or interactive event handlers require it; forms can use Server Actions without becoming Client Components. Merge Tailwind classes with `cn()` from `lib/utils.ts`. Avoid `any` when a precise type is practical.

## Testing Guidelines

No automated test runner or coverage threshold is configured. Before submitting changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`. When tests are introduced, colocate them as `*.test.ts` or `*.test.tsx`, cover user-visible behavior, and add the test command to `package.json`.

## Commit & Pull Request Guidelines

Use Conventional Commit prefixes already present in history, such as `feat:`, `fix:`, `refactor:`, and `docs:`. Keep commits focused. Pull requests should explain what changed and why, list verification commands, link relevant issues, and include screenshots for visual changes. Document migrations or environment-variable additions explicitly.

## Framework & Security Notes

Next.js 16 differs from earlier versions. Before changing framework behavior, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation notices. Keep secrets in `.env.local`; only browser-safe values may use the `NEXT_PUBLIC_` prefix. Never commit credentials or expose service-role/API keys to client code.
