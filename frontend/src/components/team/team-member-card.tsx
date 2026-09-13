import Link from "next/link";
import { ArrowUpRight, TriangleAlert } from "lucide-react";

import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { cn } from "@/lib/utils";
import type { TeamMemberStats } from "@/types";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

interface TeamMemberCardProps {
  stats: TeamMemberStats;
  avatarUrl?: string;
}

export function TeamMemberCard({ stats, avatarUrl }: TeamMemberCardProps) {
  return (
    <Link
      href={`/team/${stats.memberId}`}
      className="group block rounded-xl border bg-card p-5 shadow-xs transition-colors hover:border-primary/40 hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-3">
        <TeamMemberAvatar
          name={stats.memberName}
          avatarUrl={avatarUrl}
          withName
          jobTitle={stats.jobTitle}
          className="size-10"
        />
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          This week
        </span>
        <ReportStatusBadge status={stats.currentWeekStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4">
        <Metric label="Reports" value={stats.reportsSubmitted} />
        <Metric label="Approval" value={`${stats.approvalRate}%`} />
        <Metric label="Tasks done" value={stats.tasksCompleted} />
        <Metric label="Hours" value={`${stats.hours}h`} />
      </dl>

      <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs">
        <TriangleAlert
          className={cn(
            "size-3.5 shrink-0",
            stats.openBlockers > 0 ? "text-destructive" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        {stats.openBlockers > 0 ? (
          <span className="font-medium text-destructive">
            {stats.openBlockers} open {stats.openBlockers === 1 ? "blocker" : "blockers"}
          </span>
        ) : (
          <span className="text-muted-foreground">No open blockers</span>
        )}
      </p>
    </Link>
  );
}
