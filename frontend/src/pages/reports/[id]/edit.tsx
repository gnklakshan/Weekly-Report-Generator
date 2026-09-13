import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RequirePermission } from "@/components/layout/require-permission";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { ReportForm } from "@/components/reports/form/report-form";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { useReportForm, type ReportFormAction } from "@/hooks/use-report-form";
import { canEditReport } from "@/lib/permissions";
import { latestCorrection } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, Report, User } from "@/types";

interface EditReportFormProps {
  report: Report;
  projects: Project[];
  users: User[];
}

/** Mounted only once the report has loaded, so the form is seeded with real values. */
function EditReportForm({ report, projects, users }: EditReportFormProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);

  const reviewerName = users.find(
    (user) => user.id === latestCorrection(report)?.authorId,
  )?.fullName;

  const controller = useReportForm({
    report,
    onSaved: (saved: Report, action: ReportFormAction) => {
      toast.success(
        action === "SUBMIT"
          ? "Changes submitted for review."
          : "Draft updated.",
      );
      void router.push(`/reports/${saved.id}`);
    },
  });

  function handleCancel() {
    if (controller.isDirty) {
      setCancelOpen(true);
      return;
    }
    void router.push(`/reports/${report.id}`);
  }

  return (
    <>
      <ReportForm
        controller={controller}
        projects={projects}
        report={report}
        reviewerName={reviewerName}
        onCancel={handleCancel}
      />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Discard your changes?"
        description="You have unsaved edits on this report. Leaving now will discard them."
        confirmLabel="Discard changes"
        onConfirm={() => {
          setCancelOpen(false);
          void router.push(`/reports/${report.id}`);
        }}
      />
    </>
  );
}

function ReportLocked({ report }: { report: Report }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">
            This report can no longer be edited
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only your own drafts and reports sent back for correction can be
            changed. This one is currently{" "}
            <ReportStatusBadge status={report.status} />.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/reports/${report.id}`}>View report</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ReportEditScreen({ reportId }: { reportId: string }) {
  const { user } = useAuth();
  const { request } = useApi();
  const [report, setReport] = useState<Report | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setReport(await request<Report>(`/api/reports/${reportId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [reportId, request]);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  useEffect(() => {
    request<Project[]>("/api/projects?status=ACTIVE")
      .then(setProjects)
      .catch(() => {});
    request<User[]>("/api/users")
      .then(setUsers)
      .catch(() => {});
  }, [request]);

  if (isLoading) return <LoadingState type="detail" />;
  if (error)
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  if (!report) {
    return (
      <ErrorState
        title="Report not found"
        message="We could not find that report. It may have been deleted."
      />
    );
  }
  if (!canEditReport(user, report)) return <ReportLocked report={report} />;

  return <EditReportForm report={report} projects={projects} users={users} />;
}

export default function ReportEditPage() {
  const router = useRouter();
  const reportId =
    typeof router.query.id === "string" ? router.query.id : undefined;

  return (
    <RequirePermission permissions={["EDIT_OWN_REPORT"]}>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Edit weekly report"
          description="Update the report and resubmit it for your manager's review."
          breadcrumbs={[
            { label: "Reports", href: "/reports" },
            {
              label: "Report detail",
              href: reportId ? `/reports/${reportId}` : undefined,
            },
            { label: "Edit" },
          ]}
        />
        {/* Dynamic route params are only available after hydration. */}
        {router.isReady && reportId ? (
          <ReportEditScreen reportId={reportId} />
        ) : (
          <LoadingState type="detail" />
        )}
      </div>
    </RequirePermission>
  );
}

ReportEditPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
