import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Clock,
  History,
  Link2,
  ListTodo,
  MessageSquare,
  Pencil,
  Send,
  StickyNote,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { AchievementList } from "./achievement-list";
import { BlockerList } from "./blocker-list";
import { HoursBreakdownCard } from "./hours-breakdown-card";
import { ReportLinksList } from "./report-links-list";
import { ReportSummary } from "./report-summary";
import { ReviewTimeline } from "./review-timeline";
import { SectionCard } from "./section-card";
import { VersionHistory } from "./version-history";
import {
  PlannedTaskTableReadOnly,
  TaskTableReadOnly,
} from "./task-table-readonly";
import { ReviewFeedbackCard } from "./form/review-feedback-card";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { normalizeReport } from "@/lib/api-transform";
import { canEditReport, canReviewReport } from "@/lib/permissions";
import type { Project, Report, User } from "@/types";

type PendingAction = "SUBMIT" | "DELETE" | null;

/** Action bar for a report the signed-in user is allowed to change or review. */
function ReportActions({
  report,
  canEdit,
  canReview,
  isBusy,
  onSubmit,
  onDelete,
}: {
  report: Report;
  canEdit: boolean;
  canReview: boolean;
  isBusy: boolean;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canReview ? (
        <Button asChild size="sm">
          <Link href={`/reviews/${report.id}`}>
            <ClipboardCheck className="mr-2 size-4" aria-hidden="true" />
            Review report
          </Link>
        </Button>
      ) : null}

      {canEdit ? (
        <>
          <Button asChild variant="outline" size="sm" disabled={isBusy}>
            <Link href={`/reports/${report.id}/edit`}>
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {report.status === "DRAFT" ? (
            <>
              <Button size="sm" disabled={isBusy} onClick={onSubmit}>
                <Send className="mr-2 size-4" aria-hidden="true" />
                {isBusy ? "Working…" : "Submit for review"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label="Delete draft"
                disabled={isBusy}
                onClick={onDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </>
          ) : null}
        </>
      ) : null}

      <Button asChild variant="ghost" size="sm">
        <Link href="/reports">Back to reports</Link>
      </Button>
    </div>
  );
}

export function ReportDetail({ reportId }: { reportId: string }) {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
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
      setReport(
        normalizeReport(await request<any>(`/api/reports/${reportId}`)),
      );
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
    request<Project[]>("/api/projects")
      .then(setProjects)
      .catch(() => {});
    request<User[]>("/api/users")
      .then(setUsers)
      .catch(() => {});
  }, [request]);
  const submitReport = async () => {
    const submitted = normalizeReport(
      await request<any>(`/api/reports/${reportId}/submit`, {
        method: "POST",
      }),
    );
    setReport(submitted);
    return submitted;
  };
  const deleteReport = async () => {
    await request(`/api/reports/${reportId}`, { method: "DELETE" });
    setReport(null);
  };

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isBusy, setIsBusy] = useState(false);

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

  const canEdit = canEditReport(user, report);
  const canReview = canReviewReport(user, report);

  // Authors always see their own report; everyone else needs team-wide access.
  if (report.authorId !== user?.id && !hasPermission("VIEW_TEAM_REPORTS")) {
    return (
      <ErrorState
        title="You don't have access"
        message="This report belongs to another team member."
      />
    );
  }

  const author =
    users.find((candidate) => candidate.id === report.authorId) ?? null;
  const project =
    projects.find((candidate) => candidate.id === report.projectId) ?? null;
  const reviewer =
    users.find((candidate) => candidate.id === report.reviewedById) ?? null;

  async function runPendingAction() {
    if (!pendingAction) return;
    setIsBusy(true);
    try {
      if (pendingAction === "SUBMIT") {
        await submitReport();
        toast.success("Report submitted for review.");
      } else {
        await deleteReport();
        toast.success("Draft deleted.");
        void router.push("/reports");
        return;
      }
      setPendingAction(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "That action failed. Please try again.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={`Weekly report · ${report.week.start}`}
        description={
          author
            ? `${author.fullName} · ${project?.name ?? "Unassigned project"}`
            : (project?.name ?? "Unassigned project")
        }
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Report detail" },
        ]}
        actions={
          <ReportActions
            report={report}
            canEdit={canEdit}
            canReview={canReview}
            isBusy={isBusy}
            onSubmit={() => setPendingAction("SUBMIT")}
            onDelete={() => setPendingAction("DELETE")}
          />
        }
      />

      <div className="space-y-6">
        <ReviewFeedbackCard report={report} reviewerName={reviewer?.fullName} />
        <ReportSummary
          report={report}
          author={author}
          project={project}
          reviewer={reviewer}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard
              title="Tasks worked on this week"
              description="What was delivered, how it tracked against plan and the concrete output."
              icon={ListTodo}
            >
              <TaskTableReadOnly tasks={report.completedTasks} />
            </SectionCard>

            <SectionCard
              title="Hours breakdown"
              description="Where the week's time went, by activity type."
              icon={Clock}
            >
              <HoursBreakdownCard hours={report.hours} />
            </SectionCard>

            <SectionCard title="Notes" icon={StickyNote}>
              {report.notes.trim() ? (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {report.notes}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No additional notes.
                </p>
              )}
            </SectionCard>

            <SectionCard
              title="Planned for next week"
              description="Commitments carried into the following week."
              icon={CalendarClock}
            >
              <PlannedTaskTableReadOnly tasks={report.nextWeekTasks} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Highlights"
              icon={Trophy}
              iconClass="text-emerald-600"
            >
              <AchievementList achievements={report.achievements} />
            </SectionCard>

            <SectionCard
              title="Blockers"
              icon={AlertTriangle}
              iconClass="text-amber-600"
            >
              <BlockerList
                blockers={report.blockers}
                resolved={report.status === "APPROVED"}
              />
            </SectionCard>

            <SectionCard title="Reference links" icon={Link2}>
              <ReportLinksList links={report.links} />
            </SectionCard>

            <SectionCard
              title="Review history"
              description="Every decision taken on this report."
              icon={MessageSquare}
            >
              <ReviewTimeline comments={report.reviewComments} users={users} />
            </SectionCard>

            <SectionCard title="Submission versions" icon={History}>
              <VersionHistory
                versions={report.versions}
                currentVersion={report.currentVersion}
              />
            </SectionCard>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingAction === "SUBMIT"}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title="Submit this report for review?"
        description="Your manager will be able to review it, and you will not be able to edit it until it is approved or sent back for correction."
        confirmLabel={isBusy ? "Submitting…" : "Submit for review"}
        onConfirm={() => void runPendingAction()}
      />

      <ConfirmDialog
        open={pendingAction === "DELETE"}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title="Delete this draft?"
        description="This permanently removes the draft and everything entered in it. This cannot be undone."
        confirmLabel={isBusy ? "Deleting…" : "Delete draft"}
        variant="destructive"
        onConfirm={() => void runPendingAction()}
      />
    </>
  );
}
