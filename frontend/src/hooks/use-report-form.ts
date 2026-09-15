import { useCallback, useMemo, useState } from "react";
import { useForm, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { reportFormSchema, type ReportFormValues } from "@/lib/validators";
import { EMPTY_HOURS, TASK_TYPES } from "@/lib/constants";
import { currentWeekRange, formatWeekRange, shiftWeek } from "@/lib/date";
import { createId } from "@/lib/id";
import { canEditReport } from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { normalizeReport } from "@/lib/api-transform";
import type {
  Achievement,
  Blocker,
  PlannedTask,
  Report,
  ReportLink,
  ReportTask,
  WeekRange,
} from "@/types";

export type ReportFormStepId = 1 | 2 | 3 | 4;
export type ReportFormAction = "DRAFT" | "SUBMIT";

export const STEP_IDS: ReportFormStepId[] = [1, 2, 3, 4];

/** Fields validated when leaving a step, so errors surface where the user can fix them. */
const STEP_FIELDS: Record<ReportFormStepId, Array<keyof ReportFormValues>> = {
  1: ["projectId", "weekStart", "weekEnd", "completedTasks"],
  2: ["hours", "notes"],
  3: ["blockers", "achievements", "links"],
  4: ["nextWeekTasks"],
};

export function createEmptyTask(): ReportTask {
  return {
    id: createId("task"),
    title: "",
    priority: "MEDIUM",
    status: "COMPLETED",
    plannedPercent: 100,
    actualPercent: 100,
    plannedHours: 8,
    spentHours: 8,
    output: "",
  };
}

export function createEmptyPlannedTask(): PlannedTask {
  return { id: createId("plan"), title: "", priority: "MEDIUM", plannedHours: 6 };
}

export function createEmptyBlocker(isKeyIssue = false): Blocker {
  return { id: createId("blk"), description: "", isKeyIssue };
}

export function createEmptyAchievement(isKeyAchievement = false): Achievement {
  return { id: createId("ach"), description: "", isKeyAchievement };
}

export function createEmptyLink(): ReportLink {
  return { id: createId("lnk"), label: "", url: "" };
}

export function defaultReportFormValues(overrides?: Partial<ReportFormValues>): ReportFormValues {
  const week = currentWeekRange();
  return {
    projectId: "",
    weekStart: week.start,
    weekEnd: week.end,
    completedTasks: [createEmptyTask()],
    nextWeekTasks: [createEmptyPlannedTask()],
    blockers: [],
    achievements: [],
    hours: { ...EMPTY_HOURS },
    notes: "",
    links: [],
    ...overrides,
  };
}

/** Copies a stored report into form values. Rows are cloned so edits never mutate cached data. */
export function reportToFormValues(report: Report): ReportFormValues {
  return {
    projectId: report.projectId,
    weekStart: report.week.start,
    weekEnd: report.week.end,
    completedTasks: report.completedTasks.map((task) => ({ ...task })),
    nextWeekTasks: report.nextWeekTasks.map((task) => ({ ...task })),
    blockers: report.blockers.map((blocker) => ({ ...blocker })),
    achievements: report.achievements.map((achievement) => ({ ...achievement })),
    hours: { ...EMPTY_HOURS, ...report.hours },
    notes: report.notes,
    links: report.links.map((link) => ({ ...link })),
  };
}

export function formValuesToCreateInput(
  values: ReportFormValues,
  authorId: string,
) {
  return {
    authorId,
    projectId: values.projectId,
    weekStart: values.weekStart,
    weekEnd: values.weekEnd,
    completedTasks: values.completedTasks,
    nextWeekTasks: values.nextWeekTasks,
    blockers: values.blockers,
    achievements: values.achievements,
    hours: values.hours,
    notes: values.notes,
    links: values.links,
  };
}

export function formValuesToUpdateInput(values: ReportFormValues) {
  return {
    projectId: values.projectId,
    weekStart: values.weekStart,
    weekEnd: values.weekEnd,
    completedTasks: values.completedTasks,
    nextWeekTasks: values.nextWeekTasks,
    blockers: values.blockers,
    achievements: values.achievements,
    hours: values.hours,
    notes: values.notes,
    links: values.links,
  };
}

function stepForField(field: string): ReportFormStepId | undefined {
  for (const stepId of STEP_IDS) {
    const match = STEP_FIELDS[stepId].some(
      (name) => field === name || field.startsWith(`${name}.`),
    );
    if (match) return stepId;
  }
  return undefined;
}

interface UseReportFormOptions {
  /** Present when editing an existing report; omit to create a new one. */
  report?: Report | null;
  initialValues?: Partial<ReportFormValues>;
  /** Called after a successful save so the page can toast and navigate. */
  onSaved?: (report: Report, action: ReportFormAction) => void;
}

/**
 * All report-form logic: React Hook Form + Zod validation, wizard step
 * navigation, derived totals and the create/update/submit mutations.
 * Used unchanged by both `/reports/new` and `/reports/[id]/edit`.
 */
export function useReportForm(options: UseReportFormOptions = {}) {
  const { report, initialValues, onSaved } = options;
  const { user } = useAuth();
  const { request } = useApi();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: report ? reportToFormValues(report) : defaultReportFormValues(initialValues),
    mode: "onBlur",
  });

  const [step, setStep] = useState<ReportFormStepId>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const weekStart = form.watch("weekStart");
  const weekEnd = form.watch("weekEnd");
  const watchedHours = form.watch("hours");
  const watchedTasks = form.watch("completedTasks");

  const week = useMemo<WeekRange>(() => ({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);
  const weekLabel = week.start && week.end ? formatWeekRange(week) : "";

  const totalTaskHours = (watchedTasks ?? []).reduce(
    (sum, task) => sum + (Number(task?.spentHours) || 0),
    0,
  );
  const totalLoggedHours = TASK_TYPES.reduce(
    (sum, type) => sum + (Number(watchedHours?.[type]) || 0),
    0,
  );

  const applyWeek = useCallback(
    (next: WeekRange) => {
      form.setValue("weekStart", next.start, { shouldDirty: true });
      form.setValue("weekEnd", next.end, { shouldDirty: true });
      form.clearErrors(["weekStart", "weekEnd"]);
    },
    [form],
  );

  const goToStep = useCallback(
    async (target: ReportFormStepId) => {
      if (target <= step) {
        setStep(target);
        return true;
      }
      for (const candidate of STEP_IDS) {
        if (candidate >= target) break;
        const valid = await form.trigger(STEP_FIELDS[candidate]);
        if (!valid) {
          setStep(candidate);
          return false;
        }
      }
      setStep(target);
      return true;
    },
    [form, step],
  );

  const nextStep = useCallback(
    () => goToStep(Math.min(step + 1, STEP_IDS.length) as ReportFormStepId),
    [goToStep, step],
  );

  const previousStep = useCallback(
    () => setStep(Math.max(step - 1, 1) as ReportFormStepId),
    [step],
  );

  const focusStepForErrors = useCallback((errors: FieldErrors<ReportFormValues>) => {
    const target = Object.keys(errors)
      .map(stepForField)
      .find((candidate): candidate is ReportFormStepId => candidate !== undefined);
    if (target) setStep(target);
  }, []);

  const persist = useCallback(
    async (values: ReportFormValues, action: ReportFormAction): Promise<Report | null> => {
      if (!user) {
        setSaveError("You must be signed in to save a report.");
        return null;
      }
      if (report && !canEditReport(user, report)) {
        setSaveError("This report can no longer be edited.");
        return null;
      }

      setIsSaving(true);
      setSaveError(null);
      try {
        const savedRaw = report
          ? await request<any>(`/api/reports/${report.id}`, {
              method: "PUT",
              body: JSON.stringify(formValuesToUpdateInput(values))
            })
          : await request<any>(`/api/reports`, {
              method: "POST",
              body: JSON.stringify(formValuesToCreateInput(values, user.id))
            });
        const saved = normalizeReport(savedRaw);
        const finalRaw =
          action === "SUBMIT" 
            ? await request<any>(`/api/reports/${saved.id}/submit`, { method: "POST" }) 
            : savedRaw;
        const finalReport = normalizeReport(finalRaw);
        form.reset(reportToFormValues(finalReport));
        onSaved?.(finalReport, action);
        return finalReport;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save the report.";
        setSaveError(message);
        toast.error(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [form, onSaved, report, user, request],
  );

  const save = useCallback(
    (action: ReportFormAction) =>
      form.handleSubmit(
        (values) => persist(values, action),
        (errors) => {
          focusStepForErrors(errors);
          toast.error("Some details still need attention before this report can be saved.");
        },
      )(),
    [focusStepForErrors, form, persist],
  );

  /** Draft saves bypass full validation — users can save incomplete reports. */
  const saveDraft = useCallback(async () => {
    const values = form.getValues();
    const cleaned = {
      ...values,
      completedTasks: (values.completedTasks ?? []).filter((t) => t.title?.trim()),
      nextWeekTasks: (values.nextWeekTasks ?? []).filter((t) => t.title?.trim()),
      blockers: (values.blockers ?? []).filter((b) => b.description?.trim()),
      achievements: (values.achievements ?? []).filter((a) => a.description?.trim()),
      links: (values.links ?? []).filter((l) => l.label?.trim() && l.url?.trim()),
    };
    await persist(cleaned, "DRAFT");
  }, [form, persist]);

  return {
    form: form as UseFormReturn<ReportFormValues>,
    step,
    setStep,
    goToStep,
    nextStep,
    previousStep,
    week,
    weekLabel,
    previousWeek: () => applyWeek(shiftWeek(week, -1)),
    nextWeek: () => applyWeek(shiftWeek(week, 1)),
    jumpToCurrentWeek: () => applyWeek(currentWeekRange()),
    totalTaskHours,
    totalLoggedHours,
    isSaving,
    isDirty: form.formState.isDirty,
    saveError,
    clearSaveError: () => setSaveError(null),
    saveDraft,
    submitForReview: () => save("SUBMIT"),
  };
}

export type ReportFormController = ReturnType<typeof useReportForm>;
