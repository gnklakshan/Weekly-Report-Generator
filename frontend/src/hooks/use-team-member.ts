import { useCallback, useMemo } from "react";

import {
  buildMemberActivity,
  buildMemberProjectSummaries,
  buildMemberTrend,
  collectBlockers,
  sumHoursByType,
  type MemberActivityEntry,
  type MemberBlocker,
  type MemberProjectSummary,
} from "@/components/team/member-metrics";
import { useDashboard } from "@/hooks/use-dashboard";
import { useProjects } from "@/hooks/use-projects";
import { useReports } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-users";
import type {
  Project,
  Report,
  ReportHourBreakdown,
  TeamMemberStats,
  TrendPoint,
  User,
} from "@/types";

export interface TeamMemberView {
  /** The account record; `null` once loading finishes means the member does not exist. */
  member: User | null;
  /** Dashboard stats for the current week; `null` for people who are not team members. */
  stats: TeamMemberStats | null;
  reports: Report[];
  allProjects: Project[];
  allUsers: User[];
  projectSummaries: MemberProjectSummary[];
  trend: TrendPoint[];
  hoursByType: ReportHourBreakdown;
  blockers: MemberBlocker[];
  activity: MemberActivityEntry[];
  isLoading: boolean;
  isNotFound: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Aggregates everything `/team/[id]` needs from the four read-only services so the
 * profile component stays presentational. Callers must pass a resolved member id
 * (guard on `router.isReady` first) — mount the consumer with `key={memberId}` so
 * navigating between members resets the underlying filter state.
 */
export function useTeamMember(memberId: string): TeamMemberView {
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();
  const {
    users,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers();
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const {
    reports,
    isLoading: isReportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useReports({ authorId: memberId });

  const isLoading =
    isDashboardLoading || isUsersLoading || isProjectsLoading || isReportsLoading;
  const error = dashboardError ?? usersError ?? reportsError;

  const member = useMemo(
    () => users.find((user) => user.id === memberId) ?? null,
    [users, memberId],
  );
  const stats = useMemo(
    () => dashboard?.teamStats.find((entry) => entry.memberId === memberId) ?? null,
    [dashboard, memberId],
  );

  const projectNameOf = useCallback(
    (projectId: string) =>
      projects.find((project) => project.id === projectId)?.name ?? "Unassigned",
    [projects],
  );

  const projectSummaries = useMemo(
    () => (member ? buildMemberProjectSummaries(member, projects, reports) : []),
    [member, projects, reports],
  );
  const trend = useMemo(() => buildMemberTrend(reports), [reports]);
  const hoursByType = useMemo(() => sumHoursByType(reports), [reports]);
  const blockers = useMemo(() => collectBlockers(reports), [reports]);
  const activity = useMemo(
    () => buildMemberActivity(reports, projectNameOf),
    [reports, projectNameOf],
  );

  const refetch = useCallback(() => {
    void refetchDashboard();
    void refetchUsers();
    void refetchReports();
  }, [refetchDashboard, refetchUsers, refetchReports]);

  return {
    member,
    stats,
    reports,
    allProjects: projects,
    allUsers: users,
    projectSummaries,
    trend,
    hoursByType,
    blockers,
    activity,
    isLoading,
    isNotFound: !isLoading && member === null,
    error,
    refetch,
  };
}
