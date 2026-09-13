import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approveReviewSchema,
  requestCorrectionSchema,
  type ApproveReviewValues,
  type RequestCorrectionValues,
} from "@/lib/validators";

type ReviewAction = "approve" | "request-correction";

interface ReviewPanelProps {
  reportId: string;
  reviewerId: string;
  isBusy: boolean;
  onApprove: (input: { reportId: string; reviewerId: string; message?: string }) => Promise<void>;
  onRequestCorrection: (input: {
    reportId: string;
    reviewerId: string;
    message: string;
  }) => Promise<void>;
  onDone: () => void;
}

export function ReviewPanel({
  reportId,
  reviewerId,
  isBusy,
  onApprove,
  onRequestCorrection,
  onDone,
}: ReviewPanelProps) {
  const [activeDialog, setActiveDialog] = useState<ReviewAction | null>(null);

  const approveForm = useForm<ApproveReviewValues>({
    resolver: zodResolver(approveReviewSchema),
    defaultValues: { message: "" },
  });

  const correctionForm = useForm<RequestCorrectionValues>({
    resolver: zodResolver(requestCorrectionSchema),
    defaultValues: { message: "" },
  });

  async function handleApprove(values: ApproveReviewValues) {
    try {
      await onApprove({
        reportId,
        reviewerId,
        message: values.message?.trim() || undefined,
      });
      toast.success("Report approved.");
      approveForm.reset();
      setActiveDialog(null);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve this report.");
    }
  }

  async function handleCorrection(values: RequestCorrectionValues) {
    try {
      await onRequestCorrection({
        reportId,
        reviewerId,
        message: values.message,
      });
      toast.success("Correction requested. The author has been notified.");
      correctionForm.reset();
      setActiveDialog(null);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not request correction.");
    }
  }

  return (
    <section
      aria-label="Review actions"
      className="rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2 className="text-sm font-semibold">Review this report</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Read the full report before deciding. You can send it back for changes at any time.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => setActiveDialog("request-correction")}
        >
          <Undo2 className="mr-2 size-4" aria-hidden="true" />
          Request correction
        </Button>
        <Button
          size="sm"
          disabled={isBusy}
          onClick={() => setActiveDialog("approve")}
        >
          <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
          Approve report
        </Button>
      </div>

      <Dialog
        open={activeDialog === "approve"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
            approveForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this report?</DialogTitle>
            <DialogDescription>
              The author will be notified that their weekly report has been approved. You can
              optionally add a message.
            </DialogDescription>
          </DialogHeader>
          <Form {...approveForm}>
            <form onSubmit={approveForm.handleSubmit(handleApprove)} className="space-y-4">
              <FormField
                control={approveForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Great week — keep up the momentum."
                        rows={3}
                        disabled={isBusy}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => {
                    setActiveDialog(null);
                    approveForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy}>
                  {isBusy ? "Approving…" : "Approve"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "request-correction"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
            correctionForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request correction</DialogTitle>
            <DialogDescription>
              Explain what needs to change. The author will see your feedback when they reopen the
              report.
            </DialogDescription>
          </DialogHeader>
          <Form {...correctionForm}>
            <form onSubmit={correctionForm.handleSubmit(handleCorrection)} className="space-y-4">
              <FormField
                control={correctionForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What needs to change?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the changes the author should make…"
                        rows={4}
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => {
                    setActiveDialog(null);
                    correctionForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isBusy}>
                  {isBusy ? "Sending…" : "Request correction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
