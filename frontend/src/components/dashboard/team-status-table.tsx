import { useRouter } from "next/router";
import { Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import type { TeamMemberStats } from "@/types";

interface TeamStatusTableProps {
  stats: TeamMemberStats[];
}

const EM_DASH = "—";

/**
 * Per-member status for the selected week. Rows navigate to the member's detail
 * page. Week-scoped numbers fall back to an em dash when a member has not
 * started a report, so a genuine zero is never confused with "no report yet".
 */
export function TeamStatusTable({ stats }: TeamStatusTableProps) {
  const router = useRouter();

  function open(memberId: string) {
    void router.push(`/team/${memberId}`);
  }

  if (stats.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team members"
        description="Team members will appear here once they join the workspace."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table aria-label="Team member status for the selected week">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-semibold">Team Member</TableHead>
            <TableHead className="text-xs font-semibold">Reports</TableHead>
            <TableHead className="text-xs font-semibold">Current Week</TableHead>
            <TableHead className="text-xs font-semibold">Tasks Completed</TableHead>
            <TableHead className="text-xs font-semibold">Hours</TableHead>
            <TableHead className="text-xs font-semibold">Open Blockers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => {
            const notStarted = stat.currentWeekStatus === "NOT_STARTED";
            return (
              <TableRow
                key={stat.memberId}
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                onClick={() => open(stat.memberId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(stat.memberId);
                  }
                }}
              >
                <TableCell>
                  <TeamMemberAvatar
                    name={stat.memberName}
                    jobTitle={stat.jobTitle}
                    withName
                    className="size-8"
                  />
                </TableCell>
                <TableCell className="text-xs tabular-nums text-muted-foreground">
                  {stat.reportsSubmitted}
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={stat.currentWeekStatus} />
                </TableCell>
                <TableCell className="text-xs tabular-nums text-muted-foreground">
                  {notStarted ? EM_DASH : stat.tasksCompleted}
                </TableCell>
                <TableCell className="text-xs tabular-nums text-muted-foreground">
                  {notStarted ? EM_DASH : `${stat.hours}h`}
                </TableCell>
                <TableCell className="text-xs">
                  {notStarted ? (
                    <span className="tabular-nums text-muted-foreground">{EM_DASH}</span>
                  ) : stat.openBlockers > 0 ? (
                    <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium tabular-nums text-destructive">
                      {stat.openBlockers}
                    </span>
                  ) : (
                    <span className="tabular-nums text-muted-foreground">0</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
