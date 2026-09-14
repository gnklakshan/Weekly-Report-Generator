import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
    color: "var(--color-chart-2)",
  },
};

/** Compact bar chart of completed tasks per reporting week. */
export function TasksTrendChart({
  data,
  loading = false,
  className,
}: TasksTrendChartProps) {
  const total = data.reduce((sum, point) => sum + point.tasksCompleted, 0);
  const max = Math.max(...data.map((p) => p.tasksCompleted), 1);
  const isEmpty = !loading && data.length === 0;

  return (
    <ChartCard
      title="Tasks completed"
      description={`${total} total across ${data.length} weeks`}
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ChartContainer
        config={config}
        role="img"
        aria-label={`Bar chart of tasks completed per week, ${total} tasks in total.`}
      >
        <BarChart
          data={data}
          accessibilityLayer
          margin={{ top: 16, right: 4, left: 4, bottom: 0 }}
          barCategoryGap="20%"
        >
          <XAxis
            dataKey="weekLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `Week of ${String(value)}`}
              />
            }
          />
          <Bar dataKey="tasksCompleted" radius={[4, 4, 0, 0]} barSize={32}>
            {data.map((point) => (
              <Cell
                key={point.weekStart}
                fill="var(--color-tasksCompleted)"
                opacity={
                  point.tasksCompleted === max && data.length > 1 ? 1 : 0.65
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
