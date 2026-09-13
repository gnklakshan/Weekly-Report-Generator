import type { DashboardData } from "@/types";
import { StatusByMemberChart } from "@/components/charts/status-by-member-chart";
import { TasksTrendChart } from "@/components/charts/tasks-trend-chart";
import { TimeByTaskTypeChart } from "@/components/charts/time-by-task-type-chart";
import { WorkloadByProjectChart } from "@/components/charts/workload-by-project-chart";

interface DashboardChartsProps {
  /** Null while the first load is in flight; charts then show skeletons. */
  data: DashboardData | null;
  loading?: boolean;
}

/** Responsive grid of the four team charts. Config lives in each chart, not here. */
export function DashboardCharts({ data, loading = false }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TasksTrendChart data={data?.trend ?? []} loading={loading} className="lg:col-span-2" />
      <StatusByMemberChart data={data?.statusByMember ?? []} loading={loading} />
      <WorkloadByProjectChart data={data?.workloadByProject ?? []} loading={loading} />
      <TimeByTaskTypeChart data={data?.timeByTaskType ?? []} loading={loading} className="lg:col-span-2" />
    </div>
  );
}
