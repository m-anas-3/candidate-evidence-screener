import {
  IconCircleCheck,
  IconClock,
  IconExclamationCircle,
  IconLoader2,
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
    className: "border-dashed border-primary/45 bg-primary/5 text-primary",
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
    icon: IconLoader2,
    variant: "outline",
    className: "border-dashed border-primary/45 bg-primary/10 text-primary",
  },
  completed: {
    label: "Analyzed",
    icon: IconCircleCheck,
    variant: "outline",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  failed: {
    label: "Failed",
    icon: IconExclamationCircle,
    variant: "outline",
    className:
      "border-dashed border-foreground/45 bg-foreground/5 text-foreground",
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
      className={cn(
        "text-2xs gap-1 px-2 py-0.5 font-medium",
        config.className,
        className
      )}
      variant={config.variant ?? "outline"}
    >
      <Icon className={cn("size-3", isAnimating && "animate-spin")} />
      {config.label}
    </Badge>
  )
}
