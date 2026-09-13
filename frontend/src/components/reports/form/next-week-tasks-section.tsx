import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "./field-error";
import { SectionCard, SectionEmptyHint } from "../section-card";
import { createEmptyPlannedTask } from "@/hooks/use-report-form";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/constants";
import type { ReportFormValues } from "@/lib/validators";
import type { Priority } from "@/types";

/** Tasks planned for next week. */
export function NextWeekTasksSection() {
  const { control, register } = useFormContext<ReportFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nextWeekTasks",
    keyName: "rowId",
  });

  return (
    <SectionCard
      title="Next week"
      description="What you plan to focus on, and roughly how long it will take."
      icon={CalendarClock}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createEmptyPlannedTask())}
        >
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Add planned task
        </Button>
      }
    >
      {fields.length === 0 ? (
        <SectionEmptyHint>No plans recorded for next week yet.</SectionEmptyHint>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li
              key={field.rowId}
              className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-12 sm:items-start"
            >
              <span
                aria-hidden="true"
                className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold sm:col-span-1"
              >
                {index + 1}
              </span>

              <div className="space-y-1.5 sm:col-span-6">
                <Label htmlFor={`plan-title-${index}`} className="sr-only">
                  Planned task {index + 1}
                </Label>
                <Input
                  id={`plan-title-${index}`}
                  placeholder="Task description for next week…"
                  {...register(`nextWeekTasks.${index}.title`)}
                />
                <FieldError name={`nextWeekTasks.${index}.title`} />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor={`plan-priority-${index}`} className="sr-only">
                  Priority for planned task {index + 1}
                </Label>
                <Controller
                  control={control}
                  name={`nextWeekTasks.${index}.priority`}
                  render={({ field: priorityField }) => (
                    <Select
                      value={priorityField.value}
                      onValueChange={(value) => priorityField.onChange(value as Priority)}
                    >
                      <SelectTrigger id={`plan-priority-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {PRIORITY_LABEL[priority]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-start gap-2 sm:col-span-2">
                <div className="w-full space-y-1.5">
                  <Label htmlFor={`plan-hours-${index}`} className="sr-only">
                    Estimated hours for planned task {index + 1}
                  </Label>
                  <Input
                    id={`plan-hours-${index}`}
                    type="number"
                    min={0}
                    max={80}
                    step={0.5}
                    placeholder="Hours"
                    {...register(`nextWeekTasks.${index}.plannedHours`, { valueAsNumber: true })}
                  />
                  <FieldError name={`nextWeekTasks.${index}.plannedHours`} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove planned task ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
