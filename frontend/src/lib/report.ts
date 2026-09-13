import { TASK_TYPES } from "./constants";
import type { Achievement, Blocker, Report, ReviewComment } from "@/types";

/**
 * Derived helpers for reading a stored report. Shared by the detail, edit and
 * review screens so the same rules apply everywhere.
 */

export function totalReportHours(report: Report): number {
  return TASK_TYPES.reduce((sum, type) => sum + (Number(report.hours[type]) || 0), 0);
}

export function completedTaskCount(report: Report): number {
  return report.completedTasks.filter((task) => task.status === "COMPLETED").length;
}

export function keyBlocker(report: Report): Blocker | undefined {
  return report.blockers.find((blocker) => blocker.isKeyIssue) ?? report.blockers[0];
}

export function keyAchievement(report: Report): Achievement | undefined {
  return (
    report.achievements.find((achievement) => achievement.isKeyAchievement) ?? report.achievements[0]
  );
}

/** Blockers still needing attention — an approved report has none. */
export function openBlockers(report: Report): Blocker[] {
  return report.status === "APPROVED" ? [] : report.blockers;
}

export function latestComment(
  report: Report,
  decision?: ReviewComment["decision"],
): ReviewComment | undefined {
  return report.reviewComments
    .filter((comment) => decision === undefined || comment.decision === decision)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/** The correction request the author must respond to, if the report needs changes. */
export function latestCorrection(report: Report): ReviewComment | undefined {
  if (report.status !== "NEEDS_CORRECTION") return undefined;
  return latestComment(report, "CHANGES_REQUESTED");
}
