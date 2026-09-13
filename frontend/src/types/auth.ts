import type { User, UserRole } from "./user";

/**
 * FRONTEND MOCK AUTH ONLY.
 * These shapes mirror what a Spring Boot `/api/auth` controller would return,
 * so the mock service can later be swapped for a real HTTP implementation.
 */
export interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface AuthSession {
  user: User;
  /** Fake token; a real backend would return a JWT here. */
  token: string;
  issuedAt: string;
}

export type Permission =
  | "VIEW_OWN_REPORTS"
  | "CREATE_REPORT"
  | "EDIT_OWN_REPORT"
  | "VIEW_TEAM_REPORTS"
  | "REVIEW_REPORT"
  | "VIEW_TEAM_MEMBERS"
  | "VIEW_DASHBOARD"
  | "MANAGE_PROJECTS"
  | "MANAGE_USERS";
