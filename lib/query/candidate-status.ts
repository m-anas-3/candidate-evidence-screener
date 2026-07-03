import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Database } from "@/lib/supabase/database.types"

type AnalysisStatus = Database["public"]["Enums"]["candidate_analysis_status"]

type CandidateStatusResponse = {
  id: string
  analysis_status: AnalysisStatus
  analysis_error: string | null
}

// Statuses that mean the candidate is actively being worked on and we need
// to poll until the job completes.
const ACTIVE_STATUSES = new Set<AnalysisStatus>(["extracting", "processing"])

export function candidateStatusQueryKey(candidateId: string) {
  return ["candidate-status", candidateId] as const
}

/**
 * Polls GET /api/candidates/[candidateId]/status while the candidate is in an
 * active state (extracting or processing). Stops polling automatically once
 * a terminal state is reached.
 *
 * @param candidateId  - The candidate to watch.
 * @param initialStatus - The status rendered by the Server Component, used as
 *   the initial data so the first render is instant (no loading flash).
 */
export function useCandidateStatus(
  candidateId: string,
  initialStatus: AnalysisStatus,
  initialError: string | null = null
) {
  return useQuery({
    queryKey: candidateStatusQueryKey(candidateId),
    queryFn: async (): Promise<CandidateStatusResponse> => {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        cache: "no-store",
      })
      if (!res.ok) {
        throw new Error("Could not fetch candidate status.")
      }
      return res.json() as Promise<CandidateStatusResponse>
    },
    // Seed with the server-rendered value — no loading state on mount
    initialData: {
      id: candidateId,
      analysis_status: initialStatus,
      analysis_error: initialError,
    },
    // Poll every 3 s while in an active state, stop otherwise
    refetchInterval: (query) => {
      const status = query.state.data?.analysis_status ?? initialStatus
      return ACTIVE_STATUSES.has(status) ? 3_000 : false
    },
    // Keep polling even when the tab is in the background — analysis can take
    // up to 5 minutes and the recruiter may switch tabs while waiting
    refetchIntervalInBackground: true,
  })
}

/**
 * Returns a function that invalidates the candidate status query.
 * Call this after triggering an action (extract, analyze) so the query
 * immediately re-fetches the latest status.
 */
export function useInvalidateCandidateStatus() {
  const qc = useQueryClient()
  return (candidateId: string) =>
    qc.invalidateQueries({ queryKey: candidateStatusQueryKey(candidateId) })
}
