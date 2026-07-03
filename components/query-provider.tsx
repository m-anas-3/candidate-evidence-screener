"use client"

import { useState, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { makeQueryClient } from "@/lib/query/client"

/**
 * Wraps the app in a TanStack QueryClientProvider.
 * The QueryClient is created once per browser session and stored in state so
 * it survives re-renders without being recreated.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // useState ensures we get the same client instance on every render
  const [client] = useState(() => makeQueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
