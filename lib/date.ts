export type DateDisplay = "full" | "month-day"

export function formatDate(
  value: string | Date,
  display: DateDisplay,
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone,
    ...(display === "full" ? { year: "numeric" as const } : {}),
  }).format(new Date(value))
}
