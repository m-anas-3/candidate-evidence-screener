"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// ─── Candidate Pipeline Area Chart ───────────────────────────────────────────
interface PipelineDataPoint {
  label: string
  completed: number
  ready: number
  pending: number
  failed: number
}

const pipelineChartConfig = {
  completed: { label: "Analyzed", color: "oklch(0.72 0.18 192)" },
  ready: { label: "Ready", color: "oklch(0.78 0.12 155)" },
  pending: { label: "Pending", color: "oklch(0.82 0.14 60)" },
  failed: { label: "Failed", color: "oklch(0.70 0.20 22)" },
} satisfies ChartConfig

export function CandidatePipelineChart({ data }: { data: PipelineDataPoint[] }) {
  if (!data.length) return null
  return (
    <ChartContainer config={pipelineChartConfig} className="h-48 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.72 0.18 192)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="oklch(0.72 0.18 192)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradReady" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.78 0.12 155)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.78 0.12 155)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.82 0.14 60)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="oklch(0.82 0.14 60)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 7%)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "oklch(0.65 0.015 210)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.65 0.015 210)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="oklch(0.72 0.18 192)"
          strokeWidth={2}
          fill="url(#gradCompleted)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="ready"
          stroke="oklch(0.78 0.12 155)"
          strokeWidth={1.5}
          fill="url(#gradReady)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="pending"
          stroke="oklch(0.82 0.14 60)"
          strokeWidth={1.5}
          fill="url(#gradPending)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

// ─── Score Distribution Bar Chart ────────────────────────────────────────────
interface ScoreBucket {
  range: string
  count: number
}

const scoreChartConfig = {
  count: { label: "Candidates", color: "oklch(0.72 0.18 192)" },
} satisfies ChartConfig

function getBarColor(range: string): string {
  const start = parseInt(range.split("–")[0] ?? "0", 10)
  if (start >= 80) return "oklch(0.72 0.18 192)"
  if (start >= 60) return "oklch(0.78 0.12 155)"
  if (start >= 40) return "oklch(0.82 0.14 60)"
  return "oklch(0.70 0.20 22)"
}

export function ScoreDistributionChart({ data }: { data: ScoreBucket[] }) {
  if (!data.length || data.every((d) => d.count === 0)) return null
  return (
    <ChartContainer config={scoreChartConfig} className="h-48 w-full">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 7%)" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 10, fill: "oklch(0.65 0.015 210)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.65 0.015 210)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.range} fill={getBarColor(entry.range)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
