import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { useApi } from "@/hooks/use-api";
import { useCallback, useEffect, useState } from "react";
import type {
  DashboardData,
  DashboardFilters as DashboardFilterValues,
} from "@/types";
import { ActivityFeed } from "./activity-feed";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardFilters } from "./dashboard-filters";
import { MetricsRow } from "./metrics-row";
import { TeamStatusTable } from "./team-status-table";

/** Manager/admin view: team-wide metrics, charts, status table and activity. */
export function TeamDashboard() {
  const { request } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.weekStart) query.set("weekStart", filters.weekStart);
      if (filters.memberId) query.set("memberId", filters.memberId);
      if (filters.projectId) query.set("projectId", filters.projectId);
      if (filters.status) query.set("status", filters.status);
      if (filters.from) query.set("from", filters.from);
      if (filters.to) query.set("to", filters.to);
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
  const updateFilters = (updates: Partial<DashboardFilterValues>) =>
    setFilters((previous) => ({ ...previous, ...updates }));
  const showData = !isLoading && data !== null;

  return (
    <div className="space-y-5">
      <DashboardFilters filters={filters} onChange={updateFilters} />

      {error ? (
        <ErrorState message={error} onRetry={() => void fetchDashboard()} />
      ) : (
        <div className="space-y-5">
          {showData ? (
            <MetricsRow metrics={data.metrics} />
          ) : (
            <LoadingState type="cards" rows={4} />
          )}

          <DashboardCharts data={data} loading={isLoading} />

          <div className="grid gap-5 lg:grid-cols-3">
            <section className="space-y-3 lg:col-span-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-medium text-foreground">
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
