import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProjectWorkloadSlice } from "@/types";
import { ChartCard } from "./chart-card";

interface WorkloadByProjectChartProps {
  data: ProjectWorkloadSlice[];
  loading?: boolean;
  className?: string;
}

/** Donut of logged hours per project; each slice uses its project's chart colour token. */
export function WorkloadByProjectChart({ data, loading = false, className }: WorkloadByProjectChartProps) {
  const isEmpty = !loading && data.length === 0;
  const totalHours = data.reduce((sum, slice) => sum + slice.hours, 0);

  const config: ChartConfig = data.reduce<ChartConfig>((acc, slice) => {
    acc[slice.projectId] = {
      label: slice.projectName,
      color: `var(--color-${slice.colorToken})`,
    };
    return acc;
  }, {});

  return (
    <ChartCard
      title="Workload by project"
      description="Logged hours distribution across projects"
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ChartContainer
        config={config}
        role="img"
        aria-label={`Donut chart of ${totalHours} logged hours split across ${data.length} projects.`}
      >
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent nameKey="projectId" hideLabel />} />
          <Pie
            data={data}
            dataKey="hours"
            nameKey="projectId"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            strokeWidth={2}
          >
            {data.map((slice) => (
              <Cell key={slice.projectId} fill={`var(--color-${slice.colorToken})`} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="projectId" />} />
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
