import { Check } from "lucide-react";

import { STEP_IDS, type ReportFormStepId } from "@/hooks/use-report-form";
import { cn } from "@/lib/utils";

interface StepDefinition {
  id: ReportFormStepId;
  label: string;
}

const STEPS: StepDefinition[] = [
  { id: 1, label: "Tasks & output" },
  { id: 2, label: "Hours & notes" },
  { id: 3, label: "Blockers & highlights" },
  { id: 4, label: "Next week & submit" },
];

interface ReportStepIndicatorProps {
  step: ReportFormStepId;
  onSelect: (step: ReportFormStepId) => Promise<boolean> | boolean;
  disabled?: boolean;
}

export function ReportStepIndicator({
  step,
  onSelect,
  disabled,
}: ReportStepIndicatorProps) {
  const currentIndex = STEP_IDS.indexOf(step);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STEPS.map((stepDef, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div
              key={stepDef.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                isComplete && "bg-primary",
                isCurrent && "bg-primary/60",
                !isComplete && !isCurrent && "bg-muted",
              )}
            />
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between">
        {STEPS.map((stepDef, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <button
              key={stepDef.id}
              type="button"
              disabled={disabled}
              onClick={() => void onSelect(stepDef.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                isCurrent && "font-medium text-primary",
                isComplete && "text-foreground",
                !isComplete && !isCurrent && "text-muted-foreground",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-3" /> : stepDef.id}
              </span>
              <span className="hidden sm:inline">{stepDef.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
