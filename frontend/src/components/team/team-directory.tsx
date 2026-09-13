import { Users as UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useApi } from "@/hooks/use-api";
import { useCallback, useEffect, useState } from "react";
import type { DashboardData, User } from "@/types";
import { TeamMemberCard } from "./team-member-card";

/**
 * Manager/admin directory of team members. All figures come from
 * `DashboardData.teamStats` — nothing is recomputed here.
 */
export function TeamDirectory() {
  const { request } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsDashboardLoading(true);
    setDashboardError(null);
    try {
      setData(await request<DashboardData>("/api/dashboard"));
    } catch (err) {
      setDashboardError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard statistics.",
      );
    } finally {
      setIsDashboardLoading(false);
    }
  }, [request]);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  useEffect(() => {
    request<User[]>("/api/users")
      .then(setUsers)
      .catch((err) =>
        setUsersError(
          err instanceof Error ? err.message : "Failed to load users.",
        ),
      )
      .finally(() => setIsUsersLoading(false));
  }, [request]);

  const teamStats = data?.teamStats ?? [];
  const isLoading = isDashboardLoading || isUsersLoading;
  const error = dashboardError ?? usersError;
  const avatarOf = (memberId: string) =>
    users.find((user) => user.id === memberId)?.avatarUrl;
  const filedThisWeek = teamStats.filter(
    (entry) => entry.currentWeekStatus !== "NOT_STARTED",
  ).length;

  return (
    <>
      <PageHeader
        title="Team"
        description={
          teamStats.length > 0
            ? `${teamStats.length} ${teamStats.length === 1 ? "member" : "members"} · ${filedThisWeek} filed a report this week`
            : "Member status and weekly reporting statistics."
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState
          rows={teamStats.length > 0 ? teamStats.length : 4}
          type="cards"
        />
      ) : teamStats.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No team members yet"
          description="Once people with the team member role join the workspace, their weekly reporting status appears here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teamStats.map((entry) => (
            <TeamMemberCard
              key={entry.memberId}
              stats={entry}
              avatarUrl={avatarOf(entry.memberId)}
            />
          ))}
        </div>
      )}
    </>
  );
}
