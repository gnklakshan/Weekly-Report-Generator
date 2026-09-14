import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HoursBreakdownCard } from "@/components/reports/hours-breakdown-card";
import { useApi } from "@/hooks/use-api";
import { normalizeReports } from "@/lib/api-transform";
import {
  buildMemberActivity,
  buildMemberProjectSummaries,
  buildMemberTrend,
  collectBlockers,
  sumHoursByType,
} from "./member-metrics";
import { ROLE_LABEL } from "@/lib/constants";
import { MemberActivityCard } from "./member-activity-card";
import { MemberBlockersCard } from "./member-blockers-card";
import { MemberNotFound } from "./member-not-found";
import { MemberProfileCard } from "./member-profile-card";
import { MemberProjectsCard } from "./member-projects-card";
import { MemberReportHistory } from "./member-report-history";
import { MemberStatCards } from "./member-stat-cards";
import { MemberTasksTrendChart } from "./member-tasks-trend-chart";
import type {
  DashboardData,
  Project,
  Report,
  ReportHourBreakdown,
  TeamMemberStats,
  TrendPoint,
  User,
} from "@/types";

/** Manager view of one team member. `memberId` must already be resolved from the route. */
export function TeamMemberProfile({ memberId }: { memberId: string }) {
  const { request } = useApi();
  const [member, setMember] = useState<User | null>(null);
  const [stats, setStats] = useState<TeamMemberStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reportQuery = new URLSearchParams({ authorId: memberId });
      const [dashboard, users, projects, rawReports] = await Promise.all([
        request<DashboardData>("/api/dashboard"),
        request<User[]>("/api/users"),
        request<Project[]>("/api/projects"),
        request<any[]>(`/api/reports?${reportQuery}`),
      ]);
      setAllUsers(users);
      setAllProjects(projects);
      setReports(normalizeReports(rawReports));
      setMember(users.find((user) => user.id === memberId) ?? null);
      setStats(
        dashboard.teamStats.find((entry) => entry.memberId === memberId) ??
          null,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load team member.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId, request]);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  const projectNameOf = useCallback(
    (projectId: string) =>
      allProjects.find((project) => project.id === projectId)?.name ??
      "Unassigned",
    [allProjects],
  );
  const projectSummaries = useMemo(
    () =>
      member ? buildMemberProjectSummaries(member, allProjects, reports) : [],
    [member, allProjects, reports],
  );
  const trend = useMemo<TrendPoint[]>(
    () => buildMemberTrend(reports),
    [reports],
  );
  const hoursByType = useMemo<ReportHourBreakdown>(
    () => sumHoursByType(reports),
    [reports],
  );
  const blockers = useMemo(() => collectBlockers(reports), [reports]);
  const activity = useMemo(
    () => buildMemberActivity(reports, projectNameOf),
    [reports, projectNameOf],
  );

  if (isLoading) return <LoadingState type="detail" />;

  if (error) {
    return (
      <>
        <PageHeader
          title="Team member"
          breadcrumbs={[{ label: "Team", href: "/team" }]}
        />
        <ErrorState
          message={error ?? "Failed to load team member."}
          onRetry={() => void refetch()}
        />
      </>
    );
  }

  if (!member) return <MemberNotFound memberId={memberId} />;

  const managerName = member.managerId
    ? (allUsers.find((user) => user.id === member.managerId)?.fullName ?? null)
    : null;
  const projects = projectSummaries.map((summary) => summary.project);
  const totalHours = Object.values(hoursByType).reduce(
    (sum, hours) => sum + hours,
    0,
  );

  return (
    <>
      <PageHeader
        title={member.fullName}
        description={`${member.jobTitle} · ${ROLE_LABEL[member.role]}`}
        breadcrumbs={[
          { label: "Team", href: "/team" },
          { label: member.fullName },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/team">
              <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
              Back to team
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <MemberProfileCard
          member={member}
          managerName={managerName}
          projects={projects}
        />

        <MemberStatCards stats={stats} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tasks completed</CardTitle>
              <CardDescription className="text-xs">
                Completed tasks per reporting week, oldest to newest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTasksTrendChart data={trend} />
            </CardContent>
          </Card>

          <MemberActivityCard entries={activity} />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Hours worked</CardTitle>
            <CardDescription className="text-xs">
              {totalHours}h logged across {reports.length}{" "}
              {reports.length === 1 ? "report" : "reports"}, split by activity
              type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoursBreakdownCard hours={hoursByType} />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <MemberProjectsCard summaries={projectSummaries} />
          <MemberBlockersCard blockers={blockers} projects={allProjects} />
        </div>

        <MemberReportHistory
          reports={reports}
          projects={allProjects}
          users={allUsers}
        />
      </div>
    </>
  );
}
