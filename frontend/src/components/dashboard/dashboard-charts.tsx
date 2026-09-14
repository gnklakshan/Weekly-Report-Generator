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

/** 2x2 responsive grid of the four dashboard charts. */
export function DashboardCharts({
  data,
  loading = false,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TasksTrendChart data={data?.trend ?? []} loading={loading} />
      <TimeByTaskTypeChart
        data={data?.timeByTaskType ?? []}
        loading={loading}
      />
      <StatusByMemberChart
        data={data?.statusByMember ?? []}
        loading={loading}
      />
      <WorkloadByProjectChart
        data={data?.workloadByProject ?? []}
        loading={loading}
      />
    </div>
  );
}
