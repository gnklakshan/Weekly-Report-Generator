import type { ReportsService } from "./service-interfaces";
import type {
  ActivityItem,
  CreateReportInput,
  Report,
  ReportFilters,
  UpdateReportInput,
} from "@/types";
import { createId } from "@/lib/id";
import { MockServiceError, delay, getDb, writeDb } from "./mock-db";
import type { MockDatabase } from "./mock-db";

function matches(report: Report, filters?: ReportFilters): boolean {
  if (!filters) return true;
  if (filters.authorId && report.authorId !== filters.authorId) return false;
  if (filters.projectId && filters.projectId !== "ALL" && report.projectId !== filters.projectId) {
    return false;
  }
  if (filters.status && filters.status !== "ALL" && report.status !== filters.status) return false;
  if (filters.weekStart && report.week.start !== filters.weekStart) return false;
  if (filters.from && report.week.start < filters.from) return false;
  if (filters.to && report.week.end > filters.to) return false;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = [
      report.notes,
      ...report.completedTasks.map((task) => `${task.title} ${task.output}`),
      ...report.achievements.map((a) => a.description),
      ...report.blockers.map((b) => b.description),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  return true;
}

function pushActivity(db: MockDatabase, item: Omit<ActivityItem, "id" | "actorName">): void {
  const actorName = db.users.find((user) => user.id === item.actorId)?.fullName ?? "Someone";
  db.activity.unshift({ ...item, id: createId("act"), actorName });
  db.activity = db.activity.slice(0, 40);
}

function byNewestWeek(a: Report, b: Report): number {
  return b.week.start.localeCompare(a.week.start);
}

export const mockReportsService: ReportsService = {
  async getReports(filters) {
    const reports = getDb()
      .reports.filter((report) => matches(report, filters))
      .sort(byNewestWeek);
    return delay(reports);
  },

  async getReport(id) {
    return delay(getDb().reports.find((report) => report.id === id) ?? null);
  },

  async createReport(data: CreateReportInput) {
    const now = new Date().toISOString();
    const report: Report = {
      id: createId("r"),
      authorId: data.authorId,
      projectId: data.projectId,
      week: data.week,
      status: "DRAFT",
      completedTasks: data.completedTasks,
      nextWeekTasks: data.nextWeekTasks,
      blockers: data.blockers,
      achievements: data.achievements,
      hours: data.hours,
      notes: data.notes,
      links: data.links,
      versions: [],
      reviewComments: [],
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    writeDb((db) => {
      db.reports.push(report);
      pushActivity(db, {
        kind: "DRAFT_CREATED",
        actorId: data.authorId,
        reportId: report.id,
        message: "started a draft weekly report",
        createdAt: now,
      });
    });
    return delay(report);
  },

  async updateReport(id, data: UpdateReportInput) {
    let updated: Report | undefined;
    writeDb((db) => {
      const existing = db.reports.find((report) => report.id === id);
      if (!existing) return;
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      updated = existing;
    });
    if (!updated) throw new MockServiceError("Report not found.", "NOT_FOUND");
    return delay(updated);
  },

  async submitReport(id) {
    let updated: Report | undefined;
    const now = new Date().toISOString();
    writeDb((db) => {
      const report = db.reports.find((candidate) => candidate.id === id);
      if (!report) return;

      const isResubmission = report.status === "NEEDS_CORRECTION";
      const versionNumber = report.versions.length + 1;

      report.status = "SUBMITTED";
      report.submittedAt = now;
      report.updatedAt = now;
      report.currentVersion = versionNumber;
      delete report.reviewedAt;
      delete report.reviewedById;
      report.versions.push({ versionNumber, submittedAt: now, status: "SUBMITTED" });

      pushActivity(db, {
        kind: isResubmission ? "REPORT_RESUBMITTED" : "REPORT_SUBMITTED",
        actorId: report.authorId,
        reportId: report.id,
        message: isResubmission
          ? "resubmitted their weekly report after corrections"
          : "submitted their weekly report",
        createdAt: now,
      });
      updated = report;
    });
    if (!updated) throw new MockServiceError("Report not found.", "NOT_FOUND");
    return delay(updated);
  },

  async deleteReport(id) {
    writeDb((db) => {
      db.reports = db.reports.filter((report) => report.id !== id);
    });
    await delay(null);
  },
};

/** Shared helper reused by the reviews service. */
export { pushActivity };
