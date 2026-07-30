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

interface AnalysisProgressDataPoint {
  label: string
  completed: number
  ready: number
  pending: number
  failed: number
}

const analysisProgressChartConfig = {
  completed: { label: "Analyzed", color: "var(--chart-1)" },
  ready: { label: "Ready", color: "var(--chart-2)" },
  pending: { label: "Pending", color: "var(--chart-3)" },
  failed: { label: "Failed", color: "var(--chart-5)" },
} satisfies ChartConfig

export function AnalysisProgressChart({
  data,
}: {
  data: AnalysisProgressDataPoint[]
}) {
  if (!data.length) return null
  return (
    <ChartContainer
      config={analysisProgressChartConfig}
      className="h-48 w-full"
    >
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="var(--chart-1)"
          fillOpacity={0.16}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="ready"
          stroke="var(--chart-2)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          fill="var(--chart-2)"
          fillOpacity={0.1}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="pending"
          stroke="var(--chart-3)"
          strokeWidth={1.5}
          strokeDasharray="2 4"
          fill="var(--chart-3)"
          fillOpacity={0.06}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

interface ScoreBucket {
  range: string
  count: number
}

const scoreChartConfig = {
  count: { label: "Candidates", color: "var(--chart-1)" },
} satisfies ChartConfig

function getBarOpacity(range: string): number {
  const start = parseInt(range.split("–")[0] ?? "0", 10)
  if (start >= 80) return 1
  if (start >= 60) return 0.82
  if (start >= 40) return 0.64
  return 0.46
}

export function ScoreDistributionChart({ data }: { data: ScoreBucket[] }) {
  if (!data.length || data.every((d) => d.count === 0)) return null
  return (
    <ChartContainer config={scoreChartConfig} className="h-48 w-full">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.range}
              fill="var(--chart-primary)"
              fillOpacity={getBarOpacity(entry.range)}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
