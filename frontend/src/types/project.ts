export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  colorToken: string; // design-system chart token, e.g. "chart-1"
  memberIds: string[];
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status: ProjectStatus;
  memberIds: string[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | "ALL";
}
