import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TaskTypeSlice } from "@/types";
import { ChartCard } from "./chart-card";

interface TimeByTaskTypeChartProps {
  data: TaskTypeSlice[];
  loading?: boolean;
  className?: string;
}

const CHART_TOKENS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

/** Horizontal bar of logged hours per task type, one chart colour token each. */
export function TimeByTaskTypeChart({ data, loading = false, className }: TimeByTaskTypeChartProps) {
  const isEmpty = !loading && data.every((slice) => slice.hours === 0);

  const config: ChartConfig = data.reduce<ChartConfig>((acc, slice, index) => {
    acc[slice.taskType] = {
      label: slice.label,
      color: `var(--color-${CHART_TOKENS[index % CHART_TOKENS.length]})`,
    };
    return acc;
  }, { hours: { label: "Hours logged" } });

  return (
    <ChartCard
      title="Time by task type"
      description="Logged hours grouped by activity type"
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ChartContainer
        config={config}
        role="img"
        aria-label={`Bar chart of logged hours by task type across ${data.length} categories.`}
      >
        <BarChart
          data={data}
          layout="vertical"
          accessibilityLayer
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={96}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="hours" name="hours" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((slice) => (
              <Cell key={slice.taskType} fill={`var(--color-${slice.taskType})`} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
