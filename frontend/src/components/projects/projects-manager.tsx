import { useMemo, useState, useEffect, useCallback } from "react";
import { FolderKanban, Plus, SearchX } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { ProjectFiltersBar } from "./project-filters";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectTable } from "./project-table";
import { ALL_STATUSES } from "./project-options";
import type { Project, ProjectFilters, User } from "@/types";
import type { ProjectFormValues } from "@/lib/validators";

export function ProjectsManager() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_PROJECTS");

  const { request } = useApi();

  // Local state for projects and users
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    setProjectsError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status && filters.status !== (ALL_STATUSES as any)) {
        queryParams.append("status", filters.status);
      }
      const queryString = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";

      const data = await request<Project[]>(`/api/projects${queryString}`);
      console.log("Fetched projects:", data); // Debug log
      setProjects(data);
    } catch (err) {
      setProjectsError(
        err instanceof Error ? err.message : "Failed to load projects.",
      );
    } finally {
      setIsProjectsLoading(false);
    }
  }, [filters, request]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      try {
        // Assume users API is available at /api/users
        const data = await request<User[]>("/api/users");
        setUsers(data);
      } catch {
        // Projects remain usable when the optional member lookup fails.
      }
    }
    fetchUsers();
  }, [request]);

  const pageCount = Math.max(1, Math.ceil(projects.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageProjects = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return projects.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [projects, currentPage]);

  function updateFilters(updates: Partial<ProjectFilters>) {
    setPage(1);
    setFilters((previous) => ({ ...previous, ...updates }));
  }

  function openCreate() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setIsFormOpen(true);
  }

  async function handleSubmit(values: ProjectFormValues) {
    try {
      if (editing) {
        const updated = await request<Project>(`/api/projects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === editing.id ? updated : p)),
        );
        toast.success(`Project "${values.name}" updated.`);
      } else {
        const created = await request<Project>("/api/projects", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setProjects((prev) => [...prev, created]);
        toast.success(`Project "${values.name}" created.`);
      }
      setIsFormOpen(false);
      setEditing(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred.";
      // Throw so ProjectFormDialog catches it
      throw new Error(msg);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    try {
      await request(`/api/projects/${target.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== target.id));
      toast.success(`Project "${target.name}" deleted.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the project.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  // Projects can render without the optional member directory being ready.
  // A failed users request must not hide successfully loaded projects.
  const isLoading = isProjectsLoading;
  const error = projectsError;
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.status && filters.status !== ALL_STATUSES);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Projects the team reports against, with status and member assignments."
        actions={
          canManage ? (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add project
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        <ProjectFiltersBar filters={filters} onChange={updateFilters} />

        {error ? (
          <ErrorState message={error} onRetry={() => void fetchProjects()} />
        ) : isLoading ? (
          <LoadingState rows={DEFAULT_PAGE_SIZE} type="table" />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={isFiltered ? SearchX : FolderKanban}
            title={
              isFiltered ? "No projects match your filters" : "No projects yet"
            }
            description={
              isFiltered
                ? "Try a different search term or clear the status filter."
                : "Create the first project so team members can report weekly work against it."
            }
            actionLabel={
              isFiltered
                ? "Clear filters"
                : canManage
                  ? "Add project"
                  : undefined
            }
            onAction={
              isFiltered
                ? () =>
                    updateFilters({ search: undefined, status: ALL_STATUSES })
                : canManage
                  ? openCreate
                  : undefined
            }
          />
        ) : (
          <>
            <ProjectTable
              projects={pageProjects}
              users={users}
              canManage={canManage}
              isBusy={isDeleting}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
            <DataTablePagination
              page={currentPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalItems={projects.length}
              onPageChange={setPage}
              itemLabel="projects"
            />
          </>
        )}
      </div>

      {canManage ? (
        <>
          <ProjectFormDialog
            open={isFormOpen}
            onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) setEditing(null);
            }}
            project={editing}
            users={users}
            onSubmit={handleSubmit}
          />
          <ConfirmDialog
            open={pendingDelete !== null}
            onOpenChange={(open) => {
              if (!open) setPendingDelete(null);
            }}
            title="Delete this project?"
            description={
              pendingDelete
                ? `"${pendingDelete.name}" will be removed along with its member assignments. Existing weekly reports keep their recorded project name.`
                : ""
            }
            confirmLabel="Delete project"
            variant="destructive"
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </>
  );
}
