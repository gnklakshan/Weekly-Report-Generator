import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { type ReportFormController } from "@/hooks/use-report-form";
import type { Project, Report } from "@/types";

import { AchievementsSection } from "./achievements-section";
import { BlockersSection } from "./blockers-section";
import { HoursBreakdownSection } from "./hours-breakdown-section";
import { LinksSection } from "./links-section";
import { NextWeekTasksSection } from "./next-week-tasks-section";
import { NotesSection } from "./notes-section";
import { ReportFormActions } from "./report-form-actions";
import { ReportHeaderSection } from "./report-header-section";
import { ReportStepIndicator } from "./report-step-indicator";
import { ReviewFeedbackCard } from "./review-feedback-card";
import { SubmissionSummary } from "./submission-summary";
import { TaskTable } from "./task-table";

interface ReportFormProps {
  controller: ReportFormController;
  projects: Project[];
  /** Present when editing, so the manager's correction feedback can be shown. */
  report?: Report | null;
  reviewerName?: string;
  onCancel: () => void;
}

/** Warns before the browser discards unsaved edits on reload or tab close. */
function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}

/**
 * Composes the report wizard from the section components and supplies them all
 * with one React Hook Form instance. Shared by /reports/new and /reports/[id]/edit.
 */
export function ReportForm({ controller, projects, report, reviewerName, onCancel }: ReportFormProps) {
  const {
    form,
    step,
    goToStep,
    weekLabel,
    previousWeek,
    nextWeek,
    jumpToCurrentWeek,
    totalLoggedHours,
    isSaving,
    isDirty,
    saveError,
    saveDraft,
    submitForReview,
  } = controller;

  useUnsavedChangesWarning(isDirty);

  const projectId = form.watch("projectId");
  const projectName = projects.find((project) => project.id === projectId)?.name;

  return (
    <Form {...form}>
      {/* The wizard drives saves from explicit buttons, so the form itself never submits. */}
      <form className="space-y-8 pb-16" noValidate onSubmit={(event) => event.preventDefault()}>
        {report ? <ReviewFeedbackCard report={report} reviewerName={reviewerName} /> : null}

        <ReportHeaderSection
          projects={projects}
          weekLabel={weekLabel}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
          onCurrentWeek={jumpToCurrentWeek}
        />

        <ReportStepIndicator step={step} onSelect={goToStep} disabled={isSaving} />

        {saveError ? (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
            <AlertTitle>Could not save the report</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        ) : null}

        {step === 1 ? <TaskTable /> : null}

        {step === 2 ? (
          <div className="space-y-6">
            <HoursBreakdownSection />
            <NotesSection />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <AchievementsSection />
            <BlockersSection />
            <LinksSection />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <NextWeekTasksSection />
            <SubmissionSummary
              projectName={projectName}
              weekLabel={weekLabel}
              totalLoggedHours={totalLoggedHours}
            />
          </div>
        ) : null}

        <ReportFormActions
          step={step}
          isSaving={isSaving}
          onPreviousStep={controller.previousStep}
          onNextStep={controller.nextStep}
          onCancel={onCancel}
          onSaveDraft={() => void saveDraft()}
          onSubmit={() => void submitForReview()}
        />
      </form>
    </Form>
  );
}
