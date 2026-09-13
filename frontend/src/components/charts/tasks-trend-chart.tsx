import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { TrendPoint } from "@/types";
import { ChartCard } from "./chart-card";

interface TasksTrendChartProps {
  data: TrendPoint[];
  loading?: boolean;
  className?: string;
}

const config: ChartConfig = {
  tasksCompleted: {
    label: "Tasks completed",
    color: "var(--color-chart-1)",
  },
};

/** Area chart of completed tasks per reporting week. */
export function TasksTrendChart({ data, loading = false, className }: TasksTrendChartProps) {
  const gradientId = `trend-fill-${useId().replace(/:/g, "")}`;
  const total = data.reduce((sum, point) => sum + point.tasksCompleted, 0);
  const isEmpty = !loading && data.length === 0;

  return (
    <ChartCard
      title="Tasks completed"
      description="Completed tasks per reporting week"
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ChartContainer
        config={config}
        role="img"
        aria-label={`Area chart of tasks completed per week across ${data.length} weeks, ${total} tasks in total.`}
      >
        <AreaChart data={data} accessibilityLayer margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-tasksCompleted)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="var(--color-tasksCompleted)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="weekLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(value) => `Week of ${String(value)}`} />}
          />
          <Area
            dataKey="tasksCompleted"
            type="monotone"
            fill={`url(#${gradientId})`}
            stroke="var(--color-tasksCompleted)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
