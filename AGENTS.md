# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router project. Route layouts, pages, and global styles live in `app/`; add route-specific code beneath the corresponding route segment. Shared React components belong in `components/`, while shadcn/ui primitives live in `components/ui/`. Put reusable hooks in `hooks/`, framework-independent helpers in `lib/`, and static files in `public/`. Root configuration includes `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`.

## Build, Test, and Development Commands

Use pnpm and keep `pnpm-lock.yaml` synchronized with dependency changes.

- `pnpm dev` starts the local development server.
- `pnpm build` creates a production build and catches integration errors.
- `pnpm start` serves the completed production build.
- `pnpm lint` runs the Next.js ESLint configuration.
- `pnpm typecheck` checks strict TypeScript types without emitting files.
- `pnpm format` formats all TypeScript and TSX files with Prettier.
- `npx shadcn@latest add <component>` adds a shadcn/ui primitive.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, and Prettier defaults. Components use PascalCase exports; utilities and hooks use camelCase, with hooks prefixed by `use`. Keep component filenames lowercase and hyphenated, such as `theme-provider.tsx`. Prefer the `@/` path alias over long relative imports. Use Server Components by default and add `"use client"` only when browser state or APIs require it. Compose Tailwind classes with `cn()` from `lib/utils.ts`.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Before submitting changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`. When adding a test runner, colocate tests as `*.test.ts` or `*.test.tsx`, cover user-visible behavior, and add the command to `package.json` and this guide.

## Commit & Pull Request Guidelines

The current history uses Conventional Commit style (`feat: initial commit`). Continue with concise prefixes such as `feat:`, `fix:`, `refactor:`, or `docs:`. Pull requests should explain the change and its rationale, list verification commands, link relevant issues, and include screenshots for visual changes. Keep each PR focused and note any configuration or migration steps.

## Framework and Security Notes

Next.js APIs in this repository may differ from prior releases. Before changing framework behavior, read the relevant guide under `node_modules/next/dist/docs/` and follow deprecation notices. Store secrets in ignored environment files such as `.env.local`; never commit credentials.
