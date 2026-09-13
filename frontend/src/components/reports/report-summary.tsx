import { CalendarDays, CheckCircle2, Clock, FolderKanban, ListTodo, Send } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { ReportStatusBadge } from "./report-status-badge";
import { formatDateTime, formatWeekRange, relativeTime } from "@/lib/date";
import { totalReportHours } from "@/lib/report";
import type { Project, Report, User } from "@/types";

interface ReportSummaryProps {
  report: Report;
  author?: User | null;
  project?: Project | null;
  reviewer?: User | null;
}

/** Read-only header for a report: who, what week, which project and where it stands. */
export function ReportSummary({ report, author, project, reviewer }: ReportSummaryProps) {
  const facts = [
    { label: "Reporting week", value: formatWeekRange(report.week), icon: CalendarDays },
    { label: "Project", value: project?.name ?? "Unassigned", icon: FolderKanban },
    { label: "Tasks recorded", value: String(report.completedTasks.length), icon: ListTodo },
    { label: "Hours logged", value: `${totalReportHours(report)} h`, icon: Clock },
  ];

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {author ? (
            <TeamMemberAvatar
              name={author.fullName}
              avatarUrl={author.avatarUrl}
              jobTitle={author.jobTitle}
              withName
            />
          ) : (
            <p className="text-sm text-muted-foreground">Unknown author</p>
          )}
          <ReportStatusBadge status={report.status} />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-lg border bg-muted/20 p-3">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <fact.icon className="size-3.5" aria-hidden="true" />
                {fact.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-semibold" title={fact.value}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 text-xs text-muted-foreground">
          {report.submittedAt ? (
            <li className="flex items-center gap-1.5">
              <Send className="size-3.5" aria-hidden="true" />
              Submitted {relativeTime(report.submittedAt)}
              <span className="hidden sm:inline">({formatDateTime(report.submittedAt)})</span>
            </li>
          ) : (
            <li className="flex items-center gap-1.5">
              <Send className="size-3.5" aria-hidden="true" />
              Not submitted yet
            </li>
          )}
          {report.reviewedAt ? (
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Reviewed {relativeTime(report.reviewedAt)}
              {reviewer ? ` by ${reviewer.fullName}` : ""}
            </li>
          ) : null}
          <li>Version {report.currentVersion}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
