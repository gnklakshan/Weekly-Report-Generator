import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ReportFiltersBar } from "./report-filters";
import { ReportTable } from "./report-table";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useReports } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { ReportFilters } from "@/types";

/**
 * Report history. Team members see their own reports only; managers and admins
 * also get the member filter. Scoping comes from permissions, never from a
 * role comparison in the component.
 */
function ReportsHistoryView({ initialSearch }: { initialSearch?: string }) {
  const { user, hasPermission } = useAuth();
  const canViewTeam = hasPermission("VIEW_TEAM_REPORTS");
  const canCreate = hasPermission("CREATE_REPORT");

  const { projects } = useProjects();
  const { users } = useUsers();
  const { reports, filters, isLoading, error, refetch, updateFilters, deleteReport } = useReports({
    search: initialSearch,
    authorId: canViewTeam ? undefined : user?.id,
  });

  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFilterChange(updates: Partial<ReportFilters>) {
    updateFilters(updates);
    setPage(1);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteReport(pendingDelete);
      toast.success("Draft deleted.");
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete the draft. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(reports.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = reports.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  );

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.projectId || filters.from || filters.to,
  );

  return (
    <>
      <PageHeader
        title="Reports"
        description={
          canViewTeam
            ? "Every weekly report across the team, newest week first."
            : "Your weekly report history, newest week first."
        }
        actions={
          canCreate ? (
            <Button asChild size="sm">
              <Link href="/reports/new">
                <Plus className="mr-2 size-4" aria-hidden="true" />
                New report
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        <ReportFiltersBar
          filters={filters}
          projects={projects}
          users={canViewTeam ? users : undefined}
          onFilterChange={handleFilterChange}
        />

        {isLoading ? (
          <LoadingState type="table" rows={DEFAULT_PAGE_SIZE} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void refetch()} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? "No reports match those filters" : "No reports yet"}
            description={
              hasActiveFilters
                ? "Try widening the date range or clearing the search to see more reports."
                : canCreate
                  ? "Create your first weekly report to start building your history."
                  : "Reports will appear here once your team starts submitting them."
            }
            actionLabel={hasActiveFilters ? "Clear filters" : undefined}
            onAction={
              hasActiveFilters
                ? () =>
                    handleFilterChange({
                      search: undefined,
                      status: undefined,
                      projectId: undefined,
                      from: undefined,
                      to: undefined,
                    })
                : undefined
            }
          >
            {!hasActiveFilters && canCreate ? (
              <Button asChild size="sm">
                <Link href="/reports/new">
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  Create report
                </Link>
              </Button>
            ) : null}
          </EmptyState>
        ) : (
          <>
            <ReportTable
              reports={visible}
              projects={projects}
              users={users}
              currentUserId={user?.id}
              onDelete={(id) => setPendingDelete(id)}
            />
            <DataTablePagination
              page={currentPage}
              pageSize={DEFAULT_PAGE_SIZE}
              totalItems={reports.length}
              onPageChange={setPage}
              itemLabel="reports"
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this draft?"
        description="This permanently removes the draft report and everything you have entered in it. Submitted reports cannot be deleted."
        confirmLabel={isDeleting ? "Deleting…" : "Delete draft"}
        variant="destructive"
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

export function ReportsHistory() {
  const router = useRouter();

  // Query params are empty until hydration, so wait before seeding the filters.
  if (!router.isReady) return <LoadingState type="table" rows={DEFAULT_PAGE_SIZE} />;

  const initialSearch = typeof router.query.search === "string" ? router.query.search : undefined;
  return <ReportsHistoryView key={initialSearch ?? "all"} initialSearch={initialSearch} />;
}
