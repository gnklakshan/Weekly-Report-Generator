import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { TasksTrendChart } from "@/components/charts/tasks-trend-chart";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { MetricCard } from "./metric-card";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { useCallback, useEffect, useState } from "react";
import { currentWeekRange, weekRangeOf, formatWeekRange } from "@/lib/date";
import type {
  DashboardData,
  DashboardFilters,
  TeamMemberStats,
  WeekRange,
} from "@/types";
import { WeekStepper } from "./week-stepper";
import { ClipboardCheck, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const EM_DASH = "—";

function weekValue(notStarted: boolean, value: string): string {
  return notStarted ? EM_DASH : value;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
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
    <Card className="rounded-lg border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">My week</CardTitle>
        <p className="text-xs text-muted-foreground">{formatWeekRange(week)}</p>
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
          <div className="space-y-0">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-muted-foreground">
                Current week status
              </span>
              <ReportStatusBadge status={stats.currentWeekStatus} />
            </div>
            <div className="border-t" />
            <StatRow
              label="Tasks completed"
              value={weekValue(
                stats.currentWeekStatus === "NOT_STARTED",
                `${stats.tasksCompleted}`,
              )}
            />
            <StatRow
              label="Hours logged"
              value={weekValue(
                stats.currentWeekStatus === "NOT_STARTED",
                `${stats.hours}h`,
              )}
            />
            <StatRow
              label="Open blockers"
              value={weekValue(
                stats.currentWeekStatus === "NOT_STARTED",
                `${stats.openBlockers}`,
              )}
            />
            <StatRow
              label="Reports submitted"
              value={`${stats.reportsSubmitted}`}
            />
            <StatRow label="Approval rate" value={`${stats.approvalRate}%`} />
            <StatRow
              label="Avg hours / week"
              value={`${stats.averageHours}h`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Personal KPI tiles — only the signed-in member's own numbers. */
function PersonalMetricsRow({ stats, loading }: { stats: TeamMemberStats | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-lg border bg-card">
            <CardContent className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={ClipboardCheck}
        label="Reports Submitted"
        value={`${stats.reportsSubmitted}`}
        hint={`${stats.approvalRate}% approval rate`}
        tone={stats.approvalRate >= 80 ? "positive" : stats.approvalRate >= 50 ? "warning" : "default"}
        loading={loading}
      />
      <MetricCard
        icon={Clock}
        label="Hours Logged"
        value={`${stats.hours}h`}
        hint={`${stats.averageHours}h avg / week`}
        loading={loading}
      />
      <MetricCard
        icon={TrendingUp}
        label="Tasks Completed"
        value={`${stats.tasksCompleted}`}
        hint="across all reports"
        loading={loading}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Open Blockers"
        value={`${stats.openBlockers}`}
        hint={stats.openBlockers > 0 ? "needs attention" : "all clear"}
        tone={stats.openBlockers > 0 ? "destructive" : "positive"}
        loading={loading}
      />
    </div>
  );
}

/**
 * Team-member variant of the dashboard. Same `useDashboard` data source, scoped
 * to the signed-in member via `{ memberId }` — shows only personal stats,
 * never team-wide metrics.
 */
export function PersonalSummaryView() {
  const { user } = useAuth();
  const { request } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(
    user ? { memberId: user.id } : {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.weekStart) query.set("weekStart", filters.weekStart);
      if (filters.memberId) query.set("memberId", filters.memberId);
      const suffix = query.toString() ? `?${query}` : "";
      setData(await request<DashboardData>(`/api/dashboard${suffix}`));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard statistics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, request]);
  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (!user) return null;

  const selectedWeek = filters.weekStart
    ? weekRangeOf(filters.weekStart)
    : currentWeekRange();
  const showData = !isLoading && data !== null;
  const myStats = data?.teamStats.find((stat) => stat.memberId === user.id);

  return (
    <div className="space-y-5">
      <Card className="rounded-lg border bg-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Reporting week
            </span>
            <WeekStepper
              week={selectedWeek}
              onChange={(weekStart) =>
                setFilters((previous) => ({ ...previous, weekStart }))
              }
            />
          </div>
          <div className="space-y-1.5 text-right">
            <span className="text-xs font-medium text-muted-foreground">
              My status
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
        <ErrorState message={error} onRetry={() => void fetchDashboard()} />
      ) : (
        <div className="space-y-5">
          <PersonalMetricsRow stats={myStats} loading={isLoading} />
          <div className="grid gap-5 lg:grid-cols-2">
            <TasksTrendChart data={data?.trend ?? []} loading={isLoading} />
            <MyWeekCard
              stats={myStats}
              week={selectedWeek}
              loading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
