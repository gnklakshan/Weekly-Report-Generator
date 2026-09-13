import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";

import { relativeTime } from "@/lib/date";
import { latestCorrection } from "@/lib/report";
import type { Report } from "@/types";

interface ReviewFeedbackCardProps {
  report: Report;
  /** Display name of the reviewer, resolved by the caller from the users list. */
  reviewerName?: string;
  action?: ReactNode;
}

/**
 * Shown prominently on a NEEDS_CORRECTION report so the author sees exactly what
 * the manager asked for before editing. Renders nothing for any other status.
 */
export function ReviewFeedbackCard({ report, reviewerName, action }: ReviewFeedbackCardProps) {
  const correction = latestCorrection(report);
  if (!correction) return null;

  return (
    <section
      aria-label="Manager feedback"
      className="rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
          <MessageSquare className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-100">
            Manager feedback — changes requested
          </h2>
          <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
            {reviewerName ? `${reviewerName} · ` : ""}
            {relativeTime(correction.createdAt)} · version {correction.versionNumber}
          </p>
          <blockquote className="mt-3 whitespace-pre-line border-l-2 border-rose-300 pl-3 text-sm text-rose-900 dark:border-rose-700 dark:text-rose-100">
            {correction.message}
          </blockquote>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
