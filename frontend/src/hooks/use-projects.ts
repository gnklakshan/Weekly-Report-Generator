import { useState, useEffect, useCallback } from "react";
import type { CreateProjectInput, Project, ProjectFilters, UpdateProjectInput } from "@/types";
import { projectsService } from "@/services";

export function useProjects(initialFilters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects(filters);
      setProjects(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load projects.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchProjects();
  }, [fetchProjects]);

  const createProject = async (input: CreateProjectInput) => {
    try {
      const created = await projectsService.createProject(input);
      setProjects((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project.";
      setError(msg);
      throw err;
    }
  };

  const updateProject = async (id: string, input: UpdateProjectInput) => {
    try {
      const updated = await projectsService.updateProject(id, input);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update project.";
      setError(msg);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project.";
      setError(msg);
      throw err;
    }
  };

  return {
    projects,
    filters,
    isLoading,
    error,
    refetch: fetchProjects,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
  };
}
