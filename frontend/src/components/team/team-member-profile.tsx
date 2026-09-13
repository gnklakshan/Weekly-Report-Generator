import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoursBreakdownCard } from "@/components/reports/hours-breakdown-card";
import { useTeamMember } from "@/hooks/use-team-member";
import { ROLE_LABEL } from "@/lib/constants";
import { MemberActivityCard } from "./member-activity-card";
import { MemberBlockersCard } from "./member-blockers-card";
import { MemberNotFound } from "./member-not-found";
import { MemberProfileCard } from "./member-profile-card";
import { MemberProjectsCard } from "./member-projects-card";
import { MemberReportHistory } from "./member-report-history";
import { MemberStatCards } from "./member-stat-cards";
import { MemberTasksTrendChart } from "./member-tasks-trend-chart";

/** Manager view of one team member. `memberId` must already be resolved from the route. */
export function TeamMemberProfile({ memberId }: { memberId: string }) {
  const view = useTeamMember(memberId);

  if (view.isLoading) return <LoadingState type="detail" />;

  if (view.error) {
    return (
      <>
        <PageHeader title="Team member" breadcrumbs={[{ label: "Team", href: "/team" }]} />
        <ErrorState message={view.error} onRetry={view.refetch} />
      </>
    );
  }

  const member = view.member;
  if (!member) return <MemberNotFound memberId={memberId} />;

  const managerName = member.managerId
    ? (view.allUsers.find((user) => user.id === member.managerId)?.fullName ?? null)
    : null;
  const projects = view.projectSummaries.map((summary) => summary.project);
  const totalHours = Object.values(view.hoursByType).reduce((sum, hours) => sum + hours, 0);

  return (
    <>
      <PageHeader
        title={member.fullName}
        description={`${member.jobTitle} · ${ROLE_LABEL[member.role]}`}
        breadcrumbs={[{ label: "Team", href: "/team" }, { label: member.fullName }]}
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
        <MemberProfileCard member={member} managerName={managerName} projects={projects} />

        <MemberStatCards stats={view.stats} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tasks completed</CardTitle>
              <CardDescription className="text-xs">
                Completed tasks per reporting week, oldest to newest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberTasksTrendChart data={view.trend} />
            </CardContent>
          </Card>

          <MemberActivityCard entries={view.activity} />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Hours worked</CardTitle>
            <CardDescription className="text-xs">
              {totalHours}h logged across {view.reports.length}{" "}
              {view.reports.length === 1 ? "report" : "reports"}, split by activity type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoursBreakdownCard hours={view.hoursByType} />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <MemberProjectsCard summaries={view.projectSummaries} />
          <MemberBlockersCard blockers={view.blockers} projects={view.allProjects} />
        </div>

        <MemberReportHistory
          reports={view.reports}
          projects={view.allProjects}
          users={view.allUsers}
        />
      </div>
    </>
  );
}
