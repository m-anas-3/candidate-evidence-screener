export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading workspace</span>
      <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      <div className="h-72 animate-pulse rounded-3xl bg-muted" />
    </div>
  )
}
