import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RequirePermission } from "@/components/layout/require-permission";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ReportForm } from "@/components/reports/form/report-form";
import { useApi } from "@/hooks/use-api";
import { useReportForm, type ReportFormAction } from "@/hooks/use-report-form";
import { weekRangeOf } from "@/lib/date";
import type { ReportFormValues } from "@/lib/validators";
import type { Project, Report } from "@/types";

/**
 * Reads the optional `projectId` / `week` query params so other pages can
 * deep-link into a pre-filled form (e.g. the dashboard's missing-report row).
 */
function useNewReportInitialValues(): Partial<ReportFormValues> {
  const router = useRouter();

  return useMemo(() => {
    const values: Partial<ReportFormValues> = {};
    const { projectId, week } = router.query;

    if (typeof projectId === "string" && projectId)
      values.projectId = projectId;
    if (typeof week === "string" && week) {
      const range = weekRangeOf(week);
      values.weekStart = range.start;
      values.weekEnd = range.end;
    }
    return values;
  }, [router.query]);
}

function NewReportForm() {
  const router = useRouter();
  const initialValues = useNewReportInitialValues();
  const { request } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProjects(await request<Project[]>("/api/projects?status=ACTIVE"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [request]);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  const [cancelOpen, setCancelOpen] = useState(false);

  const controller = useReportForm({
    initialValues,
    onSaved: (report: Report, action: ReportFormAction) => {
      toast.success(
        action === "SUBMIT"
          ? "Weekly report submitted for review."
          : "Draft saved. You can finish it any time.",
      );
      void router.push(
        action === "SUBMIT" ? `/reports/${report.id}` : "/reports",
      );
    },
  });

  function handleCancel() {
    if (controller.isDirty) {
      setCancelOpen(true);
      return;
    }
    void router.push("/reports");
  }

  if (isLoading) return <LoadingState type="detail" />;
  if (error)
    return <ErrorState message={error} onRetry={() => void refetch()} />;

  return (
    <>
      <ReportForm
        controller={controller}
        projects={projects}
        onCancel={handleCancel}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Discard this report?"
        description="You have unsaved changes. Leaving now will discard everything you have entered."
        confirmLabel="Discard changes"
        onConfirm={() => {
          setCancelOpen(false);
          void router.push("/reports");
        }}
      />
    </>
  );
}

export default function ReportsNewPage() {
  const router = useRouter();

  return (
    <RequirePermission permissions={["CREATE_REPORT"]}>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Create weekly report"
          description="Record what you delivered, where your time went, and what you plan next week."
          breadcrumbs={[
            { label: "Reports", href: "/reports" },
            { label: "New report" },
          ]}
        />
        {/* Query params are only available after hydration, so wait before mounting the form. */}
        {router.isReady ? <NewReportForm /> : <LoadingState type="detail" />}
      </div>
    </RequirePermission>
  );
}

ReportsNewPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
