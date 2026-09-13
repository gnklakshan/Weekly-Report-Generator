import type { ProjectsService } from "./service-interfaces";
import type { CreateProjectInput, Project, ProjectFilters, UpdateProjectInput } from "@/types";
import { createId } from "@/lib/id";
import { MockServiceError, delay, getDb, writeDb } from "./mock-db";

const CHART_TOKENS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;

function matches(project: Project, filters?: ProjectFilters): boolean {
  if (!filters) return true;
  const search = filters.search?.trim().toLowerCase();
  if (search && !`${project.name} ${project.description}`.toLowerCase().includes(search)) {
    return false;
  }
  if (filters.status && filters.status !== "ALL" && project.status !== filters.status) return false;
  return true;
}

export const mockProjectsService: ProjectsService = {
  async getProjects(filters) {
    return delay(getDb().projects.filter((project) => matches(project, filters)));
  },

  async getProject(id) {
    return delay(getDb().projects.find((project) => project.id === id) ?? null);
  },

  async createProject(data: CreateProjectInput) {
    const project: Project = {
      id: createId("p"),
      name: data.name,
      description: data.description,
      status: data.status,
      colorToken: CHART_TOKENS[getDb().projects.length % CHART_TOKENS.length] ?? "chart-1",
      memberIds: data.memberIds,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    writeDb((db) => {
      db.projects.push(project);
    });
    return delay(project);
  },

  async updateProject(id, data: UpdateProjectInput) {
    let updated: Project | undefined;
    writeDb((db) => {
      const existing = db.projects.find((project) => project.id === id);
      if (!existing) return;
      Object.assign(existing, data);
      updated = existing;
    });
    if (!updated) throw new MockServiceError("Project not found.", "NOT_FOUND");
    return delay(updated);
  },

  async deleteProject(id) {
    writeDb((db) => {
      db.projects = db.projects.filter((project) => project.id !== id);
    });
    await delay(null);
  },
};
