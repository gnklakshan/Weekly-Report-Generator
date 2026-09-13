import { format, parseISO } from "date-fns";

import { EMPTY_HOURS, TASK_TYPES } from "@/lib/constants";
import { formatWeekRange } from "@/lib/date";
import type {
  ActivityKind,
  Project,
  Report,
  ReportHourBreakdown,
  TrendPoint,
  User,
} from "@/types";

/** Every number on the member profile is derived from that member's own reports. */

export function reportTotalHours(report: Report): number {
  return TASK_TYPES.reduce((sum, type) => sum + (Number(report.hours[type]) || 0), 0);
}

function completedTaskCount(report: Report): number {
  return report.completedTasks.filter((task) => task.status === "COMPLETED").length;
}

/** Per-week completed-task counts, oldest week first — feeds the profile trend chart. */
export function buildMemberTrend(reports: Report[]): TrendPoint[] {
  const byWeek = new Map<string, TrendPoint>();

  for (const report of reports) {
    const key = report.week.start;
    const point: TrendPoint = byWeek.get(key) ?? {
      weekStart: key,
      weekLabel: format(parseISO(key), "MMM d"),
      tasksCompleted: 0,
      hours: 0,
    };
    point.tasksCompleted += completedTaskCount(report);
    point.hours += reportTotalHours(report);
    byWeek.set(key, point);
  }

  return [...byWeek.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export function sumHoursByType(reports: Report[]): ReportHourBreakdown {
  const totals: ReportHourBreakdown = { ...EMPTY_HOURS };
  for (const report of reports) {
    for (const type of TASK_TYPES) {
      totals[type] += Number(report.hours[type]) || 0;
    }
  }
  return totals;
}

export interface MemberBlocker {
  id: string;
  description: string;
  isKeyIssue: boolean;
  projectId: string;
  weekStart: string;
  /** Mirrors the dashboard rule: blockers on a report that is not approved are still open. */
  isOpen: boolean;
}

export function collectBlockers(reports: Report[]): MemberBlocker[] {
  return reports
    .flatMap((report) =>
      report.blockers.map((blocker) => ({
        id: `${report.id}-${blocker.id}`,
        description: blocker.description,
        isKeyIssue: blocker.isKeyIssue,
        projectId: report.projectId,
        weekStart: report.week.start,
        isOpen: report.status !== "APPROVED",
      })),
    )
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

export interface MemberActivityEntry {
  id: string;
  kind: ActivityKind;
  message: string;
  createdAt: string;
  reportId: string;
}

export function buildMemberActivity(
  reports: Report[],
  projectNameOf: (projectId: string) => string,
  limit = 8,
): MemberActivityEntry[] {
  const entries = reports.flatMap<MemberActivityEntry>((report) => {
    const where = `${formatWeekRange(report.week)} · ${projectNameOf(report.projectId)}`;
    const isResubmission = report.currentVersion > 1;
    const items: MemberActivityEntry[] = [
      {
        id: `${report.id}-created`,
        kind: "DRAFT_CREATED",
        message: `Started the ${where} report`,
        createdAt: report.createdAt,
        reportId: report.id,
      },
    ];

    if (report.submittedAt) {
      items.push({
        id: `${report.id}-submitted`,
        kind: isResubmission ? "REPORT_RESUBMITTED" : "REPORT_SUBMITTED",
        message: `${isResubmission ? "Resubmitted" : "Submitted"} the ${where} report`,
        createdAt: report.submittedAt,
        reportId: report.id,
      });
    }

    if (report.reviewedAt) {
      const approved = report.status === "APPROVED";
      items.push({
        id: `${report.id}-reviewed`,
        kind: approved ? "REPORT_APPROVED" : "CORRECTION_REQUESTED",
        message: approved
          ? `${where} report was approved`
          : `${where} report was returned for correction`,
        createdAt: report.reviewedAt,
        reportId: report.id,
      });
    }

    return items;
  });

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export interface MemberProjectSummary {
  project: Project;
  reports: number;
  hours: number;
  tasksCompleted: number;
}

/** Projects the member is assigned to, or has filed a report against. */
export function buildMemberProjectSummaries(
  member: User,
  projects: Project[],
  reports: Report[],
): MemberProjectSummary[] {
  return projects
    .filter(
      (project) =>
        member.projectIds.includes(project.id) || project.memberIds.includes(member.id),
    )
    .map((project) => {
      const own = reports.filter((report) => report.projectId === project.id);
      return {
        project,
        reports: own.length,
        hours: own.reduce((sum, report) => sum + reportTotalHours(report), 0),
        tasksCompleted: own.reduce((sum, report) => sum + completedTaskCount(report), 0),
      };
    })
    .sort((a, b) => b.hours - a.hours);
}
