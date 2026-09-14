import type { TaskTypeSlice } from "@/types";
import { ChartCard } from "./chart-card";

interface TimeByTaskTypeChartProps {
  data: TaskTypeSlice[];
  loading?: boolean;
  className?: string;
}

const BAR_COLORS = [
  "bg-[var(--color-chart-1)]",
  "bg-[var(--color-chart-2)]",
  "bg-[var(--color-chart-3)]",
  "bg-[var(--color-chart-4)]",
  "bg-[var(--color-chart-5)]",
];

/** Compact list view of logged hours per task type with inline progress bars. */
export function TimeByTaskTypeChart({
  data,
  loading = false,
  className,
}: TimeByTaskTypeChartProps) {
  const totalHours = data.reduce((sum, slice) => sum + slice.hours, 0);
  const maxHours = Math.max(...data.map((s) => s.hours), 1);
  const isEmpty = !loading && totalHours === 0;

  return (
    <ChartCard
      title="Time by task type"
      description={`${totalHours}h total logged`}
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ul className="space-y-3 py-1">
        {data.map((slice, index) => {
          const pct =
            totalHours > 0 ? Math.round((slice.hours / totalHours) * 100) : 0;
          const barWidth = maxHours > 0 ? (slice.hours / maxHours) * 100 : 0;
          const colorClass = BAR_COLORS[index % BAR_COLORS.length];

          return (
            <li key={slice.taskType} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-foreground">{slice.label}</span>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {slice.hours}h
                  <span className="ml-1.5 text-xs text-muted-foreground/70">
                    {pct}%
                  </span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${colorClass}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
