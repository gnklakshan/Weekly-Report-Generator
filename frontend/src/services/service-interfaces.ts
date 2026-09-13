import type {
  ActivityItem,
  ApproveReviewInput,
  AuthSession,
  CreateProjectInput,
  CreateReportInput,
  CreateUserInput,
  Credentials,
  DashboardData,
  DashboardFilters,
  Project,
  ProjectFilters,
  RegisterInput,
  Report,
  ReportFilters,
  RequestCorrectionInput,
  ReviewQueueItem,
  UpdateProjectInput,
  UpdateReportInput,
  UpdateUserInput,
  User,
  UserFilters,
} from "@/types";

/**
 * Service contracts. The app depends on these interfaces only, so the mock
 * implementations can later be replaced by `api-*.service.ts` classes talking
 * to the Spring Boot REST API without touching components or hooks.
 */

export interface AuthService {
  login(credentials: Credentials): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}

export interface ReportsService {
  getReports(filters?: ReportFilters): Promise<Report[]>;
  getReport(id: string): Promise<Report | null>;
  createReport(data: CreateReportInput): Promise<Report>;
  updateReport(id: string, data: UpdateReportInput): Promise<Report>;
  submitReport(id: string): Promise<Report>;
  deleteReport(id: string): Promise<void>;
}

export interface ReviewsService {
  getReviewQueue(reviewerId: string): Promise<ReviewQueueItem[]>;
  approveReport(input: ApproveReviewInput): Promise<Report>;
  requestCorrection(input: RequestCorrectionInput): Promise<Report>;
}

export interface ProjectsService {
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(data: CreateProjectInput): Promise<Project>;
  updateProject(id: string, data: UpdateProjectInput): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

export interface UsersService {
  getUsers(filters?: UserFilters): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export interface DashboardService {
  getDashboard(filters?: DashboardFilters): Promise<DashboardData>;
  getActivity(limit?: number): Promise<ActivityItem[]>;
}
