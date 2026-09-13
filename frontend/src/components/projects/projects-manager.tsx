import { useMemo, useState } from "react";
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
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { ProjectFiltersBar } from "./project-filters";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectTable } from "./project-table";
import { ALL_STATUSES } from "./project-options";
import type { Project, ProjectFilters } from "@/types";
import type { ProjectFormValues } from "@/lib/validators";

export function ProjectsManager() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_PROJECTS");

  const {
    projects,
    filters,
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const { users, isLoading: isUsersLoading, error: usersError } = useUsers();

  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clamped so removing the last row of the final page never shows an empty page.
  const pageCount = Math.max(1, Math.ceil(projects.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageProjects = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return projects.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [projects, currentPage]);

  /** Every filter change goes through here, so the page resets with it — no effect needed. */
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

  /** Throws on failure so ProjectFormDialog keeps itself open and shows the error. */
  async function handleSubmit(values: ProjectFormValues) {
    if (editing) {
      await updateProject(editing.id, values);
      toast.success(`Project "${values.name}" updated.`);
    } else {
      await createProject(values);
      toast.success(`Project "${values.name}" created.`);
    }
    setIsFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    try {
      await deleteProject(target.id);
      toast.success(`Project "${target.name}" deleted.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the project.");
    } finally {
      setIsDeleting(false);
    }
  }

  const isLoading = isProjectsLoading || isUsersLoading;
  const error = projectsError ?? usersError;
  const isFiltered = Boolean(filters.search) || Boolean(filters.status && filters.status !== ALL_STATUSES);

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
          <ErrorState message={error} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <LoadingState rows={DEFAULT_PAGE_SIZE} type="table" />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={isFiltered ? SearchX : FolderKanban}
            title={isFiltered ? "No projects match your filters" : "No projects yet"}
            description={
              isFiltered
                ? "Try a different search term or clear the status filter."
                : "Create the first project so team members can report weekly work against it."
            }
            actionLabel={isFiltered ? "Clear filters" : canManage ? "Add project" : undefined}
            onAction={
              isFiltered
                ? () => updateFilters({ search: undefined, status: ALL_STATUSES })
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
