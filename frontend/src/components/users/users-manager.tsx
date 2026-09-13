import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchX, UserRoundPlus, Users as UsersIcon } from "lucide-react";
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
import {
  DEFAULT_PAGE_SIZE,
  ROLE_LABEL,
  USER_STATUS_LABEL,
} from "@/lib/constants";
import { UserFiltersBar } from "./user-filters";
import { UserFormDialog } from "./user-form-dialog";
import { UserTable } from "./user-table";
import { ALL, SELF_ACTION_HINT } from "./user-options";
import type {
  CreateUserInput,
  Project,
  UpdateUserInput,
  User,
  UserFilters,
} from "@/types";
import type { UserFormValues } from "@/lib/validators";

type PendingAction = { kind: "toggleStatus" | "delete"; user: User } | null;

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const { request } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.set("search", filters.search);
      if (filters.role) query.set("role", filters.role);
      if (filters.status) query.set("status", filters.status);
      const suffix = query.toString() ? `?${query}` : "";
      setUsers(await request<User[]>(`/api/users${suffix}`));
    } catch (err) {
      setUsersError(
        err instanceof Error ? err.message : "Failed to load users.",
      );
    } finally {
      setIsUsersLoading(false);
    }
  }, [filters, request]);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  useEffect(() => {
    request<Project[]>("/api/projects")
      .then(setProjects)
      .catch((err) =>
        setProjectsError(
          err instanceof Error ? err.message : "Failed to load projects.",
        ),
      )
      .finally(() => setIsProjectsLoading(false));
  }, [request]);
  const createUser = async (input: CreateUserInput) => {
    const created = await request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setUsers((previous) => [...previous, created]);
    return created;
  };
  const updateUser = async (id: string, input: UpdateUserInput) => {
    const updated = await request<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    setUsers((previous) =>
      previous.map((entry) => (entry.id === id ? updated : entry)),
    );
    return updated;
  };
  const deleteUser = async (id: string) => {
    await request(`/api/users/${id}`, { method: "DELETE" });
    setUsers((previous) => previous.filter((entry) => entry.id !== id));
  };

  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Clamped so removing the last row of the final page never shows an empty page.
  const pageCount = Math.max(1, Math.ceil(users.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageUsers = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return users.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [users, currentPage]);

  /** Every filter change goes through here, so the page resets with it — no effect needed. */
  function updateFilters(updates: Partial<UserFilters>) {
    setPage(1);
    setFilters((previous) => ({ ...previous, ...updates }));
  }

  function openInvite() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setIsFormOpen(true);
  }

  /** Throws on failure so UserFormDialog keeps itself open and shows the error. */
  async function handleSubmit(values: UserFormValues) {
    if (editing) {
      await updateUser(editing.id, {
        fullName: values.fullName,
        role: values.role,
        jobTitle: values.jobTitle,
        projectIds: values.projectIds,
      });
      toast.success(
        `${values.fullName} is now a ${ROLE_LABEL[values.role].toLowerCase()}. Changes saved.`,
      );
    } else {
      await createUser(values);
      toast.success(
        `Invitation sent to ${values.fullName}. Their account is ${USER_STATUS_LABEL.INVITED.toLowerCase()} until they accept.`,
      );
    }
    setIsFormOpen(false);
    setEditing(null);
  }

  /** Deactivating or removing an account both need explicit confirmation. */
  async function handleConfirm() {
    if (!pendingAction) return;
    const { kind, user } = pendingAction;
    if (user.id === currentUser?.id) {
      toast.error(SELF_ACTION_HINT);
      setPendingAction(null);
      return;
    }

    setIsBusy(true);
    try {
      if (kind === "delete") {
        await deleteUser(user.id);
        toast.success(`${user.fullName} was removed from the workspace.`);
      } else {
        const nextStatus =
          user.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED";
        await updateUser(user.id, { status: nextStatus });
        toast.success(
          `${user.fullName} is now ${USER_STATUS_LABEL[nextStatus].toLowerCase()}.`,
        );
      }
      setPendingAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "That change could not be saved.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  const isLoading = isUsersLoading || isProjectsLoading;
  const error = usersError ?? projectsError;
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.role && filters.role !== ALL) ||
    Boolean(filters.status && filters.status !== ALL);
  const isReactivating = pendingAction?.user.status === "DEACTIVATED";

  return (
    <>
      <PageHeader
        title="Users"
        description="Workspace accounts, roles and project access. Administrators only."
        actions={
          <Button size="sm" onClick={openInvite}>
            <UserRoundPlus className="mr-2 size-4" aria-hidden="true" />
            Invite user
          </Button>
        }
      />

      <div className="space-y-4">
        <UserFiltersBar filters={filters} onChange={updateFilters} />

        {error ? (
          <ErrorState message={error} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <LoadingState rows={DEFAULT_PAGE_SIZE} type="table" />
        ) : users.length === 0 ? (
          <EmptyState
            icon={isFiltered ? SearchX : UsersIcon}
            title={
              isFiltered ? "No people match your filters" : "No accounts yet"
            }
            description={
              isFiltered
                ? "Try a different search term, or clear the role and status filters."
                : "Invite the first person to give them access to the workspace."
            }
            actionLabel={isFiltered ? "Clear filters" : "Invite user"}
            onAction={
              isFiltered
                ? () =>
                    updateFilters({ search: undefined, role: ALL, status: ALL })
                : openInvite
            }
          />
        ) : (
          <>
            <UserTable
              users={pageUsers}
              projects={projects}
              currentUserId={currentUser?.id}
              isBusy={isBusy}
              onEdit={openEdit}
              onToggleStatus={(user) =>
                setPendingAction({ kind: "toggleStatus", user })
              }
              onDelete={(user) => setPendingAction({ kind: "delete", user })}
            />
            <DataTablePagination
              page={currentPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalItems={users.length}
              onPageChange={setPage}
              itemLabel="people"
            />
          </>
        )}
      </div>

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditing(null);
        }}
        user={editing}
        projects={projects}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction?.kind === "delete"
            ? `Remove ${pendingAction.user.fullName}?`
            : isReactivating
              ? "Reactivate this account?"
              : "Deactivate this account?"
        }
        description={
          pendingAction?.kind === "delete"
            ? `${pendingAction.user.fullName} will lose access immediately and be unassigned from every project. Reports they already filed are kept.`
            : pendingAction
              ? isReactivating
                ? `${pendingAction.user.fullName} will be able to sign in and file weekly reports again.`
                : `${pendingAction.user.fullName} will be signed out and unable to file reports. Their history is kept, and you can reactivate them later.`
              : ""
        }
        confirmLabel={
          pendingAction?.kind === "delete"
            ? "Remove user"
            : isReactivating
              ? "Reactivate"
              : "Deactivate"
        }
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  );
}
