export type UserRole = "TEAM_MEMBER" | "MANAGER" | "ADMIN";

export type UserStatus = "ACTIVE" | "INVITED" | "DEACTIVATED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  jobTitle: string;
  avatarUrl?: string | undefined;
  /** Project ids the user is assigned to. */
  projectIds: string[];
  managerId?: string | undefined;
  joinedAt: string; // ISO date
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  projectIds: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
  jobTitle?: string;
  projectIds?: string[];
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
}
