import { NotebookText } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "./field-error";
import { SectionCard } from "../section-card";
import type { ReportFormValues } from "@/lib/validators";

/** Optional notes and context for the reviewer. */
export function NotesSection() {
  const { register } = useFormContext<ReportFormValues>();

  return (
    <SectionCard
      title="Notes"
      description="Anything else your manager should know — sprint context, dependencies, observations."
      icon={NotebookText}
    >
      <Textarea
        id="report-notes"
        rows={5}
        placeholder="e.g. Focused on query optimisation this sprint; staging latency on Tuesday delayed the audit fixes."
        {...register("notes")}
      />
      <FieldError name="notes" />
    </SectionCard>
  );
}
