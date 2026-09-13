import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  History,
  Link2,
  ListTodo,
  MessageSquare,
  StickyNote,
  Trophy,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { AchievementList } from "@/components/reports/achievement-list";
import { BlockerList } from "@/components/reports/blocker-list";
import { HoursBreakdownCard } from "@/components/reports/hours-breakdown-card";
import { ReportLinksList } from "@/components/reports/report-links-list";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReviewTimeline } from "@/components/reports/review-timeline";
import { SectionCard } from "@/components/reports/section-card";
import { VersionHistory } from "@/components/reports/version-history";
import {
  PlannedTaskTableReadOnly,
  TaskTableReadOnly,
} from "@/components/reports/task-table-readonly";
import { ReviewPanel } from "./review-panel";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { canReviewReport } from "@/lib/permissions";
import type { Project, Report, User } from "@/types";

export function ReviewDetail({ reportId }: { reportId: string }) {
  const router = useRouter();
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
    request<Project[]>("/api/projects")
      .then(setProjects)
      .catch(() => {});
    request<User[]>("/api/users")
      .then(setUsers)
      .catch(() => {});
  }, [request]);
  const approveReport = async (input: {
    reportId: string;
    reviewerId: string;
    message?: string;
  }) => {
    const updated = await request<Report>(
      `/api/reviews/${input.reportId}/approve`,
      { method: "POST", body: JSON.stringify(input) },
    );
    setReport(updated);
    return updated;
  };
  const requestCorrection = async (input: {
    reportId: string;
    reviewerId: string;
    message: string;
  }) => {
    const updated = await request<Report>(
      `/api/reviews/${input.reportId}/request-correction`,
      { method: "POST", body: JSON.stringify(input) },
    );
    setReport(updated);
    return updated;
  };
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

  if (!canReviewReport(user, report)) {
    return (
      <ErrorState
        title="You cannot review this report"
        message={
          report.status !== "SUBMITTED"
            ? "This report is no longer awaiting review."
            : "You cannot review your own report."
        }
      />
    );
  }

  const author =
    users.find((candidate) => candidate.id === report.authorId) ?? null;
  const project =
    projects.find((candidate) => candidate.id === report.projectId) ?? null;
  const reviewer =
    users.find((candidate) => candidate.id === report.reviewedById) ?? null;

  async function handleApprove(input: {
    reportId: string;
    reviewerId: string;
    message?: string;
  }) {
    setIsBusy(true);
    try {
      await approveReport(input);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCorrection(input: {
    reportId: string;
    reviewerId: string;
    message: string;
  }) {
    setIsBusy(true);
    try {
      await requestCorrection(input);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={`Review · ${report.week.start}`}
        description={
          author
            ? `${author.fullName} · ${project?.name ?? "Unassigned project"}`
            : (project?.name ?? "Unassigned project")
        }
        breadcrumbs={[
          { label: "Reviews", href: "/reviews" },
          { label: "Review report" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/reports/${report.id}`}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              View full report page
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
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
            <ReviewPanel
              reportId={report.id}
              reviewerId={user!.id}
              isBusy={isBusy}
              onApprove={handleApprove}
              onRequestCorrection={handleCorrection}
              onDone={() => void router.push("/reviews")}
            />

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
              <BlockerList blockers={report.blockers} resolved={false} />
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
    </>
  );
}
