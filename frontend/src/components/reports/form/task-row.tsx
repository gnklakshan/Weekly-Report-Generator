import { Trash2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

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
import {
  PRIORITIES,
  PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
} from "@/lib/constants";
import type { ReportFormValues } from "@/lib/validators";
import type { Priority, TaskStatus } from "@/types";

interface TaskRowProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}

/** One editable row of the completed-tasks table. */
export function TaskRow({ index, canRemove, onRemove }: TaskRowProps) {
  const { control, register } = useFormContext<ReportFormValues>();

  return (
    <li className="space-y-4 rounded-xl border bg-card/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
          >
            {index + 1}
          </span>
          <span className="text-sm font-semibold">Task {index + 1}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove task ${index + 1}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-12">
        <div className="space-y-1.5 sm:col-span-6">
          <Label htmlFor={`task-title-${index}`} className="text-xs">
            Task name
          </Label>
          <Input
            id={`task-title-${index}`}
            placeholder="e.g. Virtualised invoice list and query optimisation"
            {...register(`completedTasks.${index}.title`)}
          />
          <FieldError name={`completedTasks.${index}.title`} />
        </div>

        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-priority-${index}`} className="text-xs">
            Priority
          </Label>
          <Controller
            control={control}
            name={`completedTasks.${index}.priority`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as Priority)}
              >
                <SelectTrigger id={`task-priority-${index}`}>
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

        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-status-${index}`} className="text-xs">
            Status
          </Label>
          <Controller
            control={control}
            name={`completedTasks.${index}.status`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as TaskStatus)}
              >
                <SelectTrigger id={`task-status-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {TASK_STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-12">
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-planned-hours-${index}`} className="text-xs">
            Planned time (h)
          </Label>
          <Input
            id={`task-planned-hours-${index}`}
            type="number"
            min={0}
            max={80}
            step={0.5}
            {...register(`completedTasks.${index}.plannedHours`, { valueAsNumber: true })}
          />
          <FieldError name={`completedTasks.${index}.plannedHours`} />
        </div>

        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-spent-hours-${index}`} className="text-xs">
            Time spent (h)
          </Label>
          <Input
            id={`task-spent-hours-${index}`}
            type="number"
            min={0}
            max={80}
            step={0.5}
            {...register(`completedTasks.${index}.spentHours`, { valueAsNumber: true })}
          />
          <FieldError name={`completedTasks.${index}.spentHours`} />
        </div>

        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-planned-percent-${index}`} className="text-xs">
            Planned %
          </Label>
          <Input
            id={`task-planned-percent-${index}`}
            type="number"
            min={0}
            max={100}
            {...register(`completedTasks.${index}.plannedPercent`, { valueAsNumber: true })}
          />
          <FieldError name={`completedTasks.${index}.plannedPercent`} />
        </div>

        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor={`task-actual-percent-${index}`} className="text-xs">
            Actual %
          </Label>
          <Input
            id={`task-actual-percent-${index}`}
            type="number"
            min={0}
            max={100}
            {...register(`completedTasks.${index}.actualPercent`, { valueAsNumber: true })}
          />
          <FieldError name={`completedTasks.${index}.actualPercent`} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`task-output-${index}`} className="text-xs">
          Output / deliverable
        </Label>
        <Input
          id={`task-output-${index}`}
          placeholder="e.g. PR #482 merged, Figma specs approved"
          {...register(`completedTasks.${index}.output`)}
        />
        <FieldError name={`completedTasks.${index}.output`} />
      </div>
    </li>
  );
}
