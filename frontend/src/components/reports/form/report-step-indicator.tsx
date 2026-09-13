import { Check, Clock, FileCheck, ListTodo, Sparkles, type LucideIcon } from "lucide-react";

import { STEP_IDS, type ReportFormStepId } from "@/hooks/use-report-form";
import { cn } from "@/lib/utils";

interface StepDefinition {
  id: ReportFormStepId;
  label: string;
  description: string;
  icon: LucideIcon;
}

const STEPS: StepDefinition[] = [
  { id: 1, label: "Tasks & output", description: "Work delivered this week", icon: ListTodo },
  { id: 2, label: "Hours & notes", description: "Time breakdown and context", icon: Clock },
  { id: 3, label: "Blockers & highlights", description: "Key issues and wins", icon: Sparkles },
  { id: 4, label: "Next week & submit", description: "Plan ahead and review", icon: FileCheck },
];

interface ReportStepIndicatorProps {
  step: ReportFormStepId;
  onSelect: (step: ReportFormStepId) => Promise<boolean> | boolean;
  disabled?: boolean;
}

export function ReportStepIndicator({ step, onSelect, disabled }: ReportStepIndicatorProps) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STEPS.map((definition) => {
        const isCurrent = step === definition.id;
        const isComplete = STEP_IDS.indexOf(step) > STEP_IDS.indexOf(definition.id);

        return (
          <li key={definition.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void onSelect(definition.id)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors",
                isCurrent
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:bg-accent/40",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-4" /> : definition.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{definition.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {definition.description}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
