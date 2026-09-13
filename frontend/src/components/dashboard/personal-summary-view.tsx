import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { TasksTrendChart } from "@/components/charts/tasks-trend-chart";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { currentWeekRange, weekRangeOf, formatWeekRange } from "@/lib/date";
import type { TeamMemberStats, WeekRange } from "@/types";
import { MetricsRow } from "./metrics-row";
import { WeekStepper } from "./week-stepper";

const EM_DASH = "—";

function weekValue(notStarted: boolean, value: string): string {
  return notStarted ? EM_DASH : value;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

function MyWeekCard({
  stats,
  week,
  loading,
}: {
  stats: TeamMemberStats | undefined;
  week: WeekRange;
  loading: boolean;
}) {
  return (
    <Card className="rounded-xl border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">My week</CardTitle>
        <CardDescription className="text-xs">{formatWeekRange(week)}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        ) : !stats ? (
          <EmptyState
            title="No report data"
            description="You have no reporting history for this workspace yet."
          />
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="text-xs text-muted-foreground">Current week status</span>
              <ReportStatusBadge status={stats.currentWeekStatus} />
            </div>
            <StatRow
              label="Tasks completed"
              value={weekValue(stats.currentWeekStatus === "NOT_STARTED", `${stats.tasksCompleted}`)}
            />
            <StatRow
              label="Hours logged"
              value={weekValue(stats.currentWeekStatus === "NOT_STARTED", `${stats.hours}h`)}
            />
            <StatRow
              label="Open blockers"
              value={weekValue(stats.currentWeekStatus === "NOT_STARTED", `${stats.openBlockers}`)}
            />
            <StatRow label="Reports submitted" value={`${stats.reportsSubmitted}`} />
            <StatRow label="Approval rate" value={`${stats.approvalRate}%`} />
            <StatRow label="Avg hours / week" value={`${stats.averageHours}h`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Team-member variant of the dashboard. Same `useDashboard` data source, scoped
 * to the signed-in member via `{ memberId }` — never a second data source.
 */
export function PersonalSummaryView() {
  const { user } = useAuth();
  const { data, filters, isLoading, error, refetch, updateFilters } = useDashboard(
    user ? { memberId: user.id } : undefined,
  );

  if (!user) return null;

  const selectedWeek = filters.weekStart ? weekRangeOf(filters.weekStart) : currentWeekRange();
  const showData = !isLoading && data !== null;
  const myStats = data?.teamStats.find((stat) => stat.memberId === user.id);

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border bg-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reporting week
            </span>
            <WeekStepper week={selectedWeek} onChange={(weekStart) => updateFilters({ weekStart })} />
          </div>
          <div className="space-y-1.5 text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My status this week
            </span>
            <div>
              {showData && myStats ? (
                <ReportStatusBadge status={myStats.currentWeekStatus} />
              ) : (
                <Skeleton className="ml-auto h-5 w-24 rounded-full" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          {showData ? <MetricsRow metrics={data.metrics} /> : <LoadingState type="cards" rows={4} />}
          <div className="grid gap-6 lg:grid-cols-2">
            <TasksTrendChart data={data?.trend ?? []} loading={isLoading} />
            <MyWeekCard stats={myStats} week={selectedWeek} loading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
