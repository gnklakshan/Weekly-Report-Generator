import { Timer } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";
import { SectionCard } from "../section-card";
import { TASK_TYPES, TASK_TYPE_LABEL } from "@/lib/constants";
import type { ReportFormValues } from "@/lib/validators";

const FULL_TIME_WEEK_HOURS = 40;

/** Editable hours-by-task-type breakdown. Optional, but feeds the workload charts. */
export function HoursBreakdownSection() {
  const { register, watch } = useFormContext<ReportFormValues>();
  const hours = watch("hours");
  const total = TASK_TYPES.reduce((sum, type) => sum + (Number(hours?.[type]) || 0), 0);

  return (
    <SectionCard
      title="Hours worked"
      description="Allocate the week across activity types. Optional, but it powers the workload charts."
      icon={Timer}
    >
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {TASK_TYPES.map((type) => (
          <div key={type} className="space-y-2 rounded-lg border bg-card p-4">
            <Label htmlFor={`hours-${type}`} className="text-xs font-semibold">
              {TASK_TYPE_LABEL[type]}
            </Label>
            <div className="relative flex items-center">
              <Input
                id={`hours-${type}`}
                type="number"
                min={0}
                max={80}
                step={0.5}
                placeholder="0"
                className="pr-10"
                {...register(`hours.${type}`, { valueAsNumber: true })}
              />
              <span className="absolute right-3 text-xs text-muted-foreground" aria-hidden="true">
                hrs
              </span>
            </div>
            <FieldError name={`hours.${type}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
        <div>
          <p className="text-sm font-semibold">Total logged hours</p>
          <p className="text-xs text-muted-foreground">
            A standard working week is {FULL_TIME_WEEK_HOURS} hours
          </p>
        </div>
        <Badge variant={total >= FULL_TIME_WEEK_HOURS ? "default" : "secondary"} className="text-sm">
          {total} hrs
        </Badge>
      </div>
    </SectionCard>
  );
}
