"use client"

import { useSyncExternalStore } from "react"

import { formatDate, type DateDisplay } from "@/lib/date"

const subscribe = () => () => undefined

export function LocalDate({
  value,
  display = "full",
}: {
  value: string
  display?: DateDisplay
}) {
  const browserReady = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const formatted = browserReady
    ? formatDate(
        value,
        display,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      )
    : null

  return (
    <time dateTime={value} aria-label={formatted ?? "Date loading"}>
      {formatted ?? "\u00a0"}
    </time>
  )
}
