import { format, parseISO } from "date-fns";
import type { DashboardService } from "./service-interfaces";
import type {
  DashboardData,
  DashboardFilters,
  DashboardMetrics,
  Project,
  ProjectWorkloadSlice,
  Report,
  ReportStatusOrMissing,
  StatusByMemberPoint,
  TaskTypeSlice,
  TeamMemberStats,
  TrendPoint,
  User,
} from "@/types";
import { TASK_TYPES, TASK_TYPE_LABEL } from "@/lib/constants";
import { currentWeekRange } from "@/lib/date";
import { delay, getDb } from "./mock-db";

/** All dashboard numbers are derived from the report dataset — nothing hard-coded. */

function inScope(report: Report, filters: DashboardFilters, weekStart: string): boolean {
  if (filters.memberId && filters.memberId !== "ALL" && report.authorId !== filters.memberId) {
    return false;
  }
  if (filters.projectId && filters.projectId !== "ALL" && report.projectId !== filters.projectId) {
    return false;
  }
  if (filters.status && filters.status !== "ALL" && report.status !== filters.status) return false;
  if (filters.from && report.week.start < filters.from) return false;
  if (filters.to && report.week.end > filters.to) return false;
  if (!filters.from && !filters.to && report.week.start !== weekStart) return false;
  return true;
}

function tasksCompleted(report: Report): number {
  return report.completedTasks.filter((task) => task.status === "COMPLETED").length;
}

function totalHours(report: Report): number {
  return TASK_TYPES.reduce((sum, type) => sum + report.hours[type], 0);
}

function buildMetrics(reports: Report[], expectedReports: number): DashboardMetrics {
  const submitted = reports.filter((report) => report.status !== "DRAFT").length;
  return {
    expectedReports,
    submittedReports: submitted,
    complianceRate: expectedReports === 0 ? 0 : Math.round((submitted / expectedReports) * 100),
    needsCorrection: reports.filter((report) => report.status === "NEEDS_CORRECTION").length,
    approved: reports.filter((report) => report.status === "APPROVED").length,
    openBlockers: reports
      .filter((report) => report.status !== "APPROVED")
      .reduce((sum, report) => sum + report.blockers.length, 0),
    tasksCompleted: reports.reduce((sum, report) => sum + tasksCompleted(report), 0),
    totalHours: reports.reduce((sum, report) => sum + totalHours(report), 0),
  };
}

function buildTrend(allReports: Report[]): TrendPoint[] {
  const byWeek = new Map<string, TrendPoint>();
  for (const report of allReports) {
    const key = report.week.start;
    const point = byWeek.get(key) ?? {
      weekStart: key,
      weekLabel: format(parseISO(key), "MMM d"),
      tasksCompleted: 0,
      hours: 0,
    };
    point.tasksCompleted += tasksCompleted(report);
    point.hours += totalHours(report);
    byWeek.set(key, point);
  }
  return [...byWeek.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function buildStatusByMember(members: User[], reports: Report[]): StatusByMemberPoint[] {
  return members.map((member) => {
    const own = reports.filter((report) => report.authorId === member.id);
    return {
      memberId: member.id,
      memberName: member.fullName.split(" ")[0] ?? member.fullName,
      draft: own.filter((r) => r.status === "DRAFT").length,
      submitted: own.filter((r) => r.status === "SUBMITTED").length,
      needsCorrection: own.filter((r) => r.status === "NEEDS_CORRECTION").length,
      approved: own.filter((r) => r.status === "APPROVED").length,
    };
  });
}

function buildWorkload(projects: Project[], reports: Report[]): ProjectWorkloadSlice[] {
  return projects
    .map((project) => {
      const own = reports.filter((report) => report.projectId === project.id);
      return {
        projectId: project.id,
        projectName: project.name,
        colorToken: project.colorToken,
        hours: own.reduce((sum, report) => sum + totalHours(report), 0),
        reports: own.length,
      };
    })
    .filter((slice) => slice.hours > 0);
}

function buildTimeByTaskType(reports: Report[]): TaskTypeSlice[] {
  return TASK_TYPES.map((taskType) => ({
    taskType,
    label: TASK_TYPE_LABEL[taskType],
    hours: reports.reduce((sum, report) => sum + report.hours[taskType], 0),
  }));
}

function buildTeamStats(
  members: User[],
  weekReports: Report[],
  allReports: Report[],
): TeamMemberStats[] {
  return members.map((member) => {
    const history = allReports.filter((report) => report.authorId === member.id);
    const submittedHistory = history.filter((report) => report.status !== "DRAFT");
    const approved = history.filter((report) => report.status === "APPROVED").length;
    const week = weekReports.find((report) => report.authorId === member.id);
    const currentWeekStatus: ReportStatusOrMissing = week ? week.status : "NOT_STARTED";
    const historyHours = history.reduce((sum, report) => sum + totalHours(report), 0);

    return {
      memberId: member.id,
      memberName: member.fullName,
      jobTitle: member.jobTitle,
      currentWeekStatus,
      reportsSubmitted: submittedHistory.length,
      approvalRate:
        submittedHistory.length === 0
          ? 0
          : Math.round((approved / submittedHistory.length) * 100),
      tasksCompleted: week ? tasksCompleted(week) : 0,
      hours: week ? totalHours(week) : 0,
      openBlockers: week && week.status !== "APPROVED" ? week.blockers.length : 0,
      averageHours: history.length === 0 ? 0 : Math.round(historyHours / history.length),
    };
  });
}

export const mockDashboardService: DashboardService = {
  async getDashboard(filters: DashboardFilters = {}) {
    const db = getDb();
    const weekStart = filters.weekStart ?? currentWeekRange().start;
    const members = db.users.filter((user) => user.role === "TEAM_MEMBER");
    const scoped = db.reports.filter((report) => inScope(report, filters, weekStart));
    const weekReports = db.reports.filter((report) => report.week.start === weekStart);

    const expectedMembers =
      filters.memberId && filters.memberId !== "ALL"
        ? members.filter((member) => member.id === filters.memberId)
        : members;

    const data: DashboardData = {
      metrics: buildMetrics(scoped, expectedMembers.length),
      trend: buildTrend(db.reports),
      statusByMember: buildStatusByMember(expectedMembers, db.reports),
      workloadByProject: buildWorkload(db.projects, scoped.length ? scoped : weekReports),
      timeByTaskType: buildTimeByTaskType(scoped.length ? scoped : weekReports),
      activity: db.activity.slice(0, 8),
      teamStats: buildTeamStats(expectedMembers, weekReports, db.reports),
    };
    return delay(data);
  },

  async getActivity(limit = 10) {
    return delay(getDb().activity.slice(0, limit));
  },
};
