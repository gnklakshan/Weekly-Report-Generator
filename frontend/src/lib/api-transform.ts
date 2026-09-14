/**
 * Transforms between backend DTO shapes and frontend type shapes.
 *
 * The backend ReportResponseDto uses flat `weekStart` / `weekEnd` fields,
 * while the frontend Report type nests them as `week: { start, end }`.
 * Similarly, create/update requests must flatten the nested week back out.
 */
import type { Report } from "@/types";

/** Raw shape returned by the backend API (flat week fields). */
interface RawReportResponse {
  id: string;
  authorId: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  status: Report["status"];
  completedTasks: Report["completedTasks"];
  nextWeekTasks: Report["nextWeekTasks"];
  blockers: Report["blockers"];
  achievements: Report["achievements"];
  hours: Report["hours"];
  notes: string;
  links: Report["links"];
  versions: Report["versions"];
  reviewComments: Report["reviewComments"];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;
}

/**
 * Normalize a raw backend report response into the frontend Report shape.
 * Converts flat `weekStart`/`weekEnd` into a nested `week` object.
 */
export function normalizeReport(raw: RawReportResponse): Report {
  return {
    id: raw.id,
    authorId: raw.authorId,
    projectId: raw.projectId,
    week: { start: raw.weekStart, end: raw.weekEnd },
    status: raw.status,
    completedTasks: raw.completedTasks,
    nextWeekTasks: raw.nextWeekTasks,
    blockers: raw.blockers,
    achievements: raw.achievements,
    hours: raw.hours,
    notes: raw.notes,
    links: raw.links,
    versions: raw.versions,
    reviewComments: raw.reviewComments,
    currentVersion: raw.currentVersion,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    submittedAt: raw.submittedAt,
    reviewedAt: raw.reviewedAt,
    reviewedById: raw.reviewedById,
  };
}

/** Normalize an array of raw reports. */
export function normalizeReports(rawList: RawReportResponse[]): Report[] {
  return rawList.map(normalizeReport);
}

/**
 * Flatten the frontend nested `week` into `weekStart`/`weekEnd` for the backend.
 * Used when creating or updating a report.
 */
export function flattenWeek(week: { start: string; end: string }): {
  weekStart: string;
  weekEnd: string;
} {
  return { weekStart: week.start, weekEnd: week.end };
}
