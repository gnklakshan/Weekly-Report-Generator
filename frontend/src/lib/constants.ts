import type {
  Priority,
  ProjectStatus,
  ReportStatus,
  ReportStatusOrMissing,
  ReviewComment,
  TaskStatus,
  TaskType,
  UserRole,
  UserStatus,
} from "@/types";

export const APP_NAME = "Weekly Reports";
export const APP_DESCRIPTION =
  "Weekly report generator and team dashboard for internal delivery teams.";

/** Mock persistence key — replaced by API calls once a backend exists. */
export const STORAGE_KEY_DB = "wr.mock-db.v1";
export const STORAGE_KEY_SESSION = "wr.session.v1";

/** Simulated network latency for mock services (ms). */
export const MOCK_LATENCY_MS = 260;

export const REPORT_STATUS_LABEL: Record<ReportStatusOrMissing, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs correction",
  APPROVED: "Approved",
  NOT_STARTED: "Not started",
};

/** Statuses a stored report can have — used by report filters. */
export const REPORT_STATUSES: ReportStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "NEEDS_CORRECTION",
  "APPROVED",
];

/** Adds the synthetic NOT_STARTED used by dashboard filters for members with no report. */
export const REPORT_STATUSES_WITH_MISSING: ReportStatusOrMissing[] = [
  ...REPORT_STATUSES,
  "NOT_STARTED",
];

export const REVIEW_DECISION_LABEL: Record<ReviewComment["decision"], string> = {
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  MEETINGS: "Meetings",
  DOCUMENTATION: "Documentation",
  OTHER: "Other",
};

export const TASK_TYPES: TaskType[] = [
  "DEVELOPMENT",
  "TESTING",
  "MEETINGS",
  "DOCUMENTATION",
  "OTHER",
];

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const TASK_STATUSES: TaskStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export const ROLE_LABEL: Record<UserRole, string> = {
  TEAM_MEMBER: "Team member",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  DEACTIVATED: "Deactivated",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  ARCHIVED: "Archived",
};

export const EMPTY_HOURS: Record<TaskType, number> = {
  DEVELOPMENT: 0,
  TESTING: 0,
  MEETINGS: 0,
  DOCUMENTATION: 0,
  OTHER: 0,
};

export const DEFAULT_PAGE_SIZE = 8;
