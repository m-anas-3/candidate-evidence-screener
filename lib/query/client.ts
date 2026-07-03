import { QueryClient } from "@tanstack/react-query"

/**
 * Creates a QueryClient with sensible defaults for this app.
 *
 * - staleTime 30 s: candidate status data is fresh enough for 30 s without a
 *   refetch. Keeps the UI snappy on tab focus without hammering Supabase.
 * - gcTime 5 min: keep unused data in cache for 5 minutes so navigating back
 *   to a page feels instant.
 * - retry 1: one retry on transient network failures; don't hammer on 4xx.
 * - refetchOnWindowFocus false: Next.js App Router refreshes on navigation
 *   already; double-refetching on window focus is noisy here.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
