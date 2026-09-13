import { Link2, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "./field-error";
import { SectionCard, SectionEmptyHint } from "../section-card";
import { createEmptyLink } from "@/hooks/use-report-form";
import type { ReportFormValues } from "@/lib/validators";

/** Optional supporting links — pull requests, designs, tickets, previews. */
export function LinksSection() {
  const { control, register } = useFormContext<ReportFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "links", keyName: "rowId" });

  return (
    <SectionCard
      title="Links"
      description="Attach pull requests, designs, tickets or deployed previews."
      icon={Link2}
      action={
        <Button type="button" variant="outline" size="sm" onClick={() => append(createEmptyLink())}>
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Add link
        </Button>
      }
    >
      {fields.length === 0 ? (
        <SectionEmptyHint>No links attached.</SectionEmptyHint>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.rowId} className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-12 sm:items-center">
                <Input
                  aria-label={`Link ${index + 1} label`}
                  placeholder="Label (e.g. Frontend PR)"
                  className="sm:col-span-5"
                  {...register(`links.${index}.label`)}
                />
                <Input
                  aria-label={`Link ${index + 1} URL`}
                  type="url"
                  placeholder="https://…"
                  className="sm:col-span-6"
                  {...register(`links.${index}.url`)}
                />
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove link ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-1 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <FieldError name={`links.${index}.label`} />
                </div>
                <div className="sm:col-span-6">
                  <FieldError name={`links.${index}.url`} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
