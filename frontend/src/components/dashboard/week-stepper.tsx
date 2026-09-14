import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { currentWeekRange, formatWeekRange, shiftWeek } from "@/lib/date";
import type { WeekRange } from "@/types";

interface WeekStepperProps {
  week: WeekRange;
  /** Emits the Monday ISO date for the newly selected week. */
  onChange: (weekStart: string) => void;
}

/** Prev / next week stepper with a "This week" reset. */
export function WeekStepper({ week, onChange }: WeekStepperProps) {
  const current = currentWeekRange();
  const isCurrent = week.start === current.start;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        aria-label="Previous week"
        onClick={() => onChange(shiftWeek(week, -1).start)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      <div className="min-w-[9rem] px-1 text-center">
        <div className="text-sm font-medium tabular-nums">
          {formatWeekRange(week)}
        </div>
        {!isCurrent && (
          <div className="text-xs text-muted-foreground">Selected week</div>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        aria-label="Next week"
        onClick={() => onChange(shiftWeek(week, 1).start)}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="ml-1 h-8 text-xs"
        onClick={() => onChange(current.start)}
        disabled={isCurrent}
      >
        Today
      </Button>
    </div>
  );
}
