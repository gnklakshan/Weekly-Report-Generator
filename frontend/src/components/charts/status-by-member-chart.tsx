import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StatusByMemberPoint } from "@/types";
import { ChartCard } from "./chart-card";

interface StatusByMemberChartProps {
  data: StatusByMemberPoint[];
  loading?: boolean;
  className?: string;
}

/** Colours loosely mirror the report status badges; the legend supplies the text label. */
const config: ChartConfig = {
  draft: { label: "Draft", color: "var(--color-chart-3)" },
  submitted: { label: "Submitted", color: "var(--color-chart-4)" },
  needsCorrection: { label: "Needs correction", color: "var(--color-chart-1)" },
  approved: { label: "Approved", color: "var(--color-chart-2)" },
};

function totalReports(point: StatusByMemberPoint): number {
  return point.draft + point.submitted + point.needsCorrection + point.approved;
}

/** Stacked bar chart of report counts by status for each team member. */
export function StatusByMemberChart({ data, loading = false, className }: StatusByMemberChartProps) {
  const isEmpty = !loading && (data.length === 0 || data.every((point) => totalReports(point) === 0));

  return (
    <ChartCard
      title="Reports by member"
      description="Report status breakdown per team member"
      loading={loading}
      isEmpty={isEmpty}
      className={className}
    >
      <ChartContainer
        config={config}
        role="img"
        aria-label={`Stacked bar chart of report status for ${data.length} team members.`}
      >
        <BarChart data={data} accessibilityLayer margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="memberName"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="draft" stackId="a" fill="var(--color-draft)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="submitted" stackId="a" fill="var(--color-submitted)" />
          <Bar dataKey="needsCorrection" stackId="a" fill="var(--color-needsCorrection)" />
          <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
