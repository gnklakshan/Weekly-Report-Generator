import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "./field-error";
import { SectionCard, SectionEmptyHint } from "../section-card";
import { createEmptyBlocker } from "@/hooks/use-report-form";
import type { ReportFormValues } from "@/lib/validators";

/** Blockers / challenges. Exactly one may be flagged as the key issue. */
export function BlockersSection() {
  const { control, register, setValue } = useFormContext<ReportFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "blockers",
    keyName: "rowId",
  });

  function toggleKeyIssue(index: number, value: boolean) {
    if (value) {
      fields.forEach((_, other) => {
        if (other !== index) setValue(`blockers.${other}.isKeyIssue`, false, { shouldDirty: true });
      });
    }
    setValue(`blockers.${index}.isKeyIssue`, value, { shouldDirty: true });
  }

  return (
    <SectionCard
      title="Blockers and challenges"
      description="Dependencies, risks or anything slowing the work down."
      icon={AlertCircle}
      iconClass="text-rose-500"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createEmptyBlocker(fields.length === 0))}
        >
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Add blocker
        </Button>
      }
    >
      {fields.length === 0 ? (
        <SectionEmptyHint>
          No blockers recorded. Add anything your manager should be aware of.
        </SectionEmptyHint>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.rowId} className="space-y-2 rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <Input
                  aria-label={`Blocker ${index + 1}`}
                  placeholder="e.g. Awaiting security review sign-off for the OAuth endpoint"
                  className="flex-1"
                  {...register(`blockers.${index}.description`)}
                />
                <Button
                  type="button"
                  variant={field.isKeyIssue ? "destructive" : "outline"}
                  size="sm"
                  aria-pressed={field.isKeyIssue}
                  onClick={() => toggleKeyIssue(index, !field.isKeyIssue)}
                >
                  {field.isKeyIssue ? "Key issue" : "Mark as key"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove blocker ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <FieldError name={`blockers.${index}.description`} />
            </li>
          ))}
        </ul>
      )}

      <FieldError name="blockers" />
    </SectionCard>
  );
}
