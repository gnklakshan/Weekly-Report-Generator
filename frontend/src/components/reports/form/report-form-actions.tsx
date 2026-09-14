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
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFirstStep || isSaving}
          onClick={onPreviousStep}
        >
          <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onSubmit}
          >
            <Send className="mr-1.5 size-4" aria-hidden="true" />
            {isSaving ? "Submitting..." : "Submit report"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onNextStep}
          >
            Continue
            <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={onSaveDraft}
        >
          <Save className="mr-1.5 size-4" aria-hidden="true" />
          {isSaving ? "Saving..." : "Save draft"}
        </Button>
      </div>
    </div>
  );
}
