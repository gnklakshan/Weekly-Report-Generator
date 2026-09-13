import type { ReportStatusOrMissing, TaskType } from "./report";

export interface DashboardFilters {
  weekStart?: string;
  from?: string;
  to?: string;
  memberId?: string | "ALL";
  projectId?: string | "ALL";
  status?: ReportStatusOrMissing | "ALL";
}

export interface DashboardMetrics {
  expectedReports: number;
  submittedReports: number;
  complianceRate: number; // 0..100
  needsCorrection: number;
  approved: number;
  openBlockers: number;
  tasksCompleted: number;
  totalHours: number;
}

export interface TrendPoint {
  weekLabel: string;
  weekStart: string;
  tasksCompleted: number;
  hours: number;
}

export interface StatusByMemberPoint {
  memberId: string;
  memberName: string;
  draft: number;
  submitted: number;
  needsCorrection: number;
  approved: number;
}

export interface ProjectWorkloadSlice {
  projectId: string;
  projectName: string;
  colorToken: string;
  hours: number;
  reports: number;
}

export interface TaskTypeSlice {
  taskType: TaskType;
  label: string;
  hours: number;
}

export type ActivityKind =
  | "REPORT_SUBMITTED"
  | "REPORT_APPROVED"
  | "CORRECTION_REQUESTED"
  | "DRAFT_CREATED"
  | "REPORT_RESUBMITTED";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  actorId: string;
  actorName: string;
  reportId?: string | undefined;
  message: string;
  createdAt: string;
}

export interface TeamMemberStats {
  memberId: string;
  memberName: string;
  jobTitle: string;
  currentWeekStatus: ReportStatusOrMissing;
  reportsSubmitted: number;
  approvalRate: number; // 0..100
  tasksCompleted: number;
  hours: number;
  openBlockers: number;
  averageHours: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  trend: TrendPoint[];
  statusByMember: StatusByMemberPoint[];
  workloadByProject: ProjectWorkloadSlice[];
  timeByTaskType: TaskTypeSlice[];
  activity: ActivityItem[];
  teamStats: TeamMemberStats[];
}
