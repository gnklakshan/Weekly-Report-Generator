import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STEP_IDS, type ReportFormStepId } from "@/hooks/use-report-form";

interface ReportFormActionsProps {
  step: ReportFormStepId;
  isSaving: boolean;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

/** Wizard footer plus the Save draft / Submit for review / Cancel actions. */
export function ReportFormActions({
  step,
  isSaving,
  onPreviousStep,
  onNextStep,
  onCancel,
  onSaveDraft,
  onSubmit,
}: ReportFormActionsProps) {
  const isFirstStep = step === STEP_IDS[0];
  const isLastStep = step === STEP_IDS[STEP_IDS.length - 1];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={isFirstStep || isSaving} onClick={onPreviousStep}>
          <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
          Previous
        </Button>

        {isLastStep ? (
          <Button type="button" disabled={isSaving} onClick={onSubmit}>
            <Send className="mr-2 size-4" aria-hidden="true" />
            {isSaving ? "Submitting…" : "Submit for review"}
          </Button>
        ) : (
          <Button type="button" disabled={isSaving} onClick={onNextStep}>
            Continue
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
        <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isSaving} onClick={onSaveDraft}>
          <Save className="mr-2 size-4" aria-hidden="true" />
          {isSaving ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" size="sm" disabled={isSaving} onClick={onSubmit}>
          <Send className="mr-2 size-4" aria-hidden="true" />
          Submit for review
        </Button>
      </div>
    </div>
  );
}
