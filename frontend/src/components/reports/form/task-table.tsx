import { ListTodo, Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "./field-error";
import { SectionCard } from "../section-card";
import { TaskRow } from "./task-row";
import { createEmptyTask } from "@/hooks/use-report-form";
import type { ReportFormValues } from "@/lib/validators";

/** Editable "Tasks Completed" table. Rows are managed by React Hook Form's field array. */
export function TaskTable() {
  const { control } = useFormContext<ReportFormValues>();
  // `keyName` avoids clobbering the domain `id` each task row already carries.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "completedTasks",
    keyName: "rowId",
  });

  return (
    <SectionCard
      title="Tasks completed"
      description="Work delivered this week, with progress and the tangible output."
      icon={ListTodo}
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(createEmptyTask())}>
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Add task
        </Button>
      }
    >
      <ul className="space-y-4">
        {fields.map((field, index) => (
          <TaskRow
            key={field.rowId}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </ul>

      <FieldError name="completedTasks" />
      <TaskHoursSummary />
    </SectionCard>
  );
}

function TaskHoursSummary() {
  const { watch } = useFormContext<ReportFormValues>();
  const tasks = watch("completedTasks");
  const total = (tasks ?? []).reduce((sum, task) => sum + (Number(task?.spentHours) || 0), 0);

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm">
      <span className="text-muted-foreground">Total time logged across tasks</span>
      <span className="font-semibold">
        {total} h
      </span>
    </div>
  );
}
