export type ReportStatus = "DRAFT" | "SUBMITTED" | "NEEDS_CORRECTION" | "APPROVED";

/** Used by dashboards for members with no report in the selected week. */
export type ReportStatusOrMissing = ReportStatus | "NOT_STARTED";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskType = "DEVELOPMENT" | "TESTING" | "MEETINGS" | "DOCUMENTATION" | "OTHER";

export interface ReportTask {
  id: string;
  title: string;
  priority: Priority;
  plannedPercent: number;
  actualPercent: number;
  status: TaskStatus;
  plannedHours: number;
  spentHours: number;
  output: string;
}

export interface PlannedTask {
  id: string;
  title: string;
  priority: Priority;
  plannedHours: number;
}

export interface Blocker {
  id: string;
  description: string;
  isKeyIssue: boolean;
}

export interface Achievement {
  id: string;
  description: string;
  isKeyAchievement: boolean;
}

export type ReportHourBreakdown = Record<TaskType, number>;

export interface ReportLink {
  id: string;
  label: string;
  url: string;
}

export interface ReviewComment {
  id: string;
  reportId: string;
  versionNumber: number;
  authorId: string;
  message: string;
  decision: "APPROVED" | "CHANGES_REQUESTED";
  createdAt: string;
}

export interface ReportVersion {
  versionNumber: number;
  submittedAt: string;
  status: ReportStatus;
  reviewCommentId?: string | undefined;
}

export interface WeekRange {
  /** ISO date (Monday). */
  start: string;
  /** ISO date (Sunday). */
  end: string;
}

export interface Report {
  id: string;
  authorId: string;
  projectId: string;
  week: WeekRange;
  status: ReportStatus;
  completedTasks: ReportTask[];
  nextWeekTasks: PlannedTask[];
  blockers: Blocker[];
  achievements: Achievement[];
  hours: ReportHourBreakdown;
  notes: string;
  links: ReportLink[];
  versions: ReportVersion[];
  reviewComments: ReviewComment[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | undefined;
  reviewedAt?: string | undefined;
  reviewedById?: string | undefined;
}

export interface CreateReportInput {
  authorId: string;
  projectId: string;
  week: WeekRange;
  completedTasks: ReportTask[];
  nextWeekTasks: PlannedTask[];
  blockers: Blocker[];
  achievements: Achievement[];
  hours: ReportHourBreakdown;
  notes: string;
  links: ReportLink[];
}

export type UpdateReportInput = Partial<Omit<CreateReportInput, "authorId">>;

export interface ReportFilters {
  authorId?: string;
  projectId?: string | "ALL";
  status?: ReportStatus | "ALL";
  search?: string;
  weekStart?: string;
  from?: string;
  to?: string;
}
