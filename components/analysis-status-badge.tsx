import {
  IconCircleCheck,
  IconClock,
  IconExclamationCircle,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/supabase/database.types"

type AnalysisStatus = Database["public"]["Enums"]["candidate_analysis_status"]

const statusConfig: Record<
  AnalysisStatus,
  {
    label: string
    className: string
    icon: React.ElementType
    variant?: "secondary" | "destructive" | "outline"
  }
> = {
  pending: {
    label: "Pending",
    icon: IconClock,
    variant: "outline",
    className:
      "border-muted-foreground/20 bg-muted/30 text-muted-foreground hover:bg-muted/40",
  },
  extracting: {
    label: "Extracting",
    icon: IconLoader2,
    variant: "outline",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
  },
  ready: {
    label: "Ready",
    icon: IconCircleCheck,
    variant: "outline",
    className:
      "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
  },
  processing: {
    label: "Processing",
    icon: IconSparkles,
    variant: "outline",
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-400 hover:bg-sky-500/15",
  },
  completed: {
    label: "Analyzed",
    icon: IconCircleCheck,
    variant: "outline",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15",
  },
  failed: {
    label: "Failed",
    icon: IconExclamationCircle,
    variant: "outline",
    className:
      "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15",
  },
}

export function AnalysisStatusBadge({
  status,
  className,
}: {
  status: AnalysisStatus
  className?: string
}) {
  const config = statusConfig[status]
  const Icon = config.icon
  const isAnimating = status === "extracting" || status === "processing"

  return (
    <Badge
      className={cn("text-2xs font-medium gap-1 px-2 py-0.5", config.className, className)}
      variant={config.variant ?? "outline"}
    >
      <Icon className={cn("size-3", isAnimating && "animate-spin")} />
      {config.label}
    </Badge>
  )
}
