import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { useDashboard } from "@/hooks/use-dashboard";
import { ActivityFeed } from "./activity-feed";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardFilters } from "./dashboard-filters";
import { MetricsRow } from "./metrics-row";
import { TeamStatusTable } from "./team-status-table";

/** Manager/admin view: team-wide metrics, charts, status table and activity. */
export function TeamDashboard() {
  const { data, filters, isLoading, error, refetch, updateFilters } = useDashboard();
  const showData = !isLoading && data !== null;

  return (
    <div className="space-y-6">
      <DashboardFilters filters={filters} onChange={updateFilters} />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          {showData ? <MetricsRow metrics={data.metrics} /> : <LoadingState type="cards" rows={4} />}

          <DashboardCharts data={data} loading={isLoading} />

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="space-y-3 lg:col-span-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team status this week
                </h2>
                {showData ? (
                  <span className="text-xs text-muted-foreground">
                    {data.teamStats.length} members
                  </span>
                ) : null}
              </div>
              {showData ? (
                <TeamStatusTable stats={data.teamStats} />
              ) : (
                <LoadingState type="table" rows={5} />
              )}
            </section>

            <section className="lg:col-span-1">
              {showData ? (
                <ActivityFeed activity={data.activity} />
              ) : (
                <LoadingState type="table" rows={4} />
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
