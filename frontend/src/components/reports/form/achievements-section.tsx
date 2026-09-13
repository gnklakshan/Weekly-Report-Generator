import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "./field-error";
import { SectionCard, SectionEmptyHint } from "../section-card";
import { createEmptyAchievement } from "@/hooks/use-report-form";
import type { ReportFormValues } from "@/lib/validators";

/** Achievements / highlights. Exactly one may be flagged as the key achievement. */
export function AchievementsSection() {
  const { control, register, setValue } = useFormContext<ReportFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "achievements",
    keyName: "rowId",
  });

  function toggleKey(index: number, value: boolean) {
    if (value) {
      fields.forEach((_, other) => {
        if (other !== index) {
          setValue(`achievements.${other}.isKeyAchievement`, false, { shouldDirty: true });
        }
      });
    }
    setValue(`achievements.${index}.isKeyAchievement`, value, { shouldDirty: true });
  }

  return (
    <SectionCard
      title="Achievements and highlights"
      description="Wins worth calling out — shipped work, resolved risks, measurable improvements."
      icon={Sparkles}
      iconClass="text-amber-500"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(createEmptyAchievement(fields.length === 0))}
        >
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Add highlight
        </Button>
      }
    >
      {fields.length === 0 ? (
        <SectionEmptyHint>
          No highlights yet. Add the wins you want your manager to see.
        </SectionEmptyHint>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.rowId} className="space-y-2 rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <Input
                  aria-label={`Achievement ${index + 1}`}
                  placeholder="e.g. Cut initial page load time by 45%"
                  className="flex-1"
                  {...register(`achievements.${index}.description`)}
                />
                <Button
                  type="button"
                  variant={field.isKeyAchievement ? "default" : "outline"}
                  size="sm"
                  aria-pressed={field.isKeyAchievement}
                  onClick={() => toggleKey(index, !field.isKeyAchievement)}
                >
                  {field.isKeyAchievement ? "Key achievement" : "Mark as key"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove achievement ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <FieldError name={`achievements.${index}.description`} />
            </li>
          ))}
        </ul>
      )}

      <FieldError name="achievements" />
    </SectionCard>
  );
}
