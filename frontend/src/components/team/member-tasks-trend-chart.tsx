import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatWeekRange, weekRangeOf } from "@/lib/date";
import type { TrendPoint } from "@/types";

const chartConfig = {
  tasksCompleted: {
    label: "Tasks completed",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

/**
 * Per-week completed-task counts for one member, derived from their own reports.
 * `ChartContainer` already provides the ResponsiveContainer, so the chart is a direct child.
 */
export function MemberTasksTrendChart({ data }: { data: TrendPoint[] }) {
  const rangesByLabel = useMemo(
    () =>
      new Map(
        data.map((point) => [point.weekLabel, formatWeekRange(weekRangeOf(point.weekStart))]),
      ),
    [data],
  );

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-xs italic text-muted-foreground">
        No completed tasks recorded yet, so there is no trend to plot.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="weekLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis width={32} allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => rangesByLabel.get(String(value)) ?? String(value)}
            />
          }
        />
        <Area
          dataKey="tasksCompleted"
          type="monotone"
          fill="var(--color-tasksCompleted)"
          fillOpacity={0.18}
          stroke="var(--color-tasksCompleted)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
