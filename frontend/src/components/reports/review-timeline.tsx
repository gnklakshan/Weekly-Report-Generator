import { CheckCircle2, MessageSquare, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { REVIEW_DECISION_LABEL } from "@/lib/constants";
import { formatDateTime, relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ReviewComment, User } from "@/types";

interface ReviewTimelineProps {
  comments: ReviewComment[];
  users: User[];
}

/** Chronological record of every manager decision on this report. */
export function ReviewTimeline({ comments, users }: ReviewTimelineProps) {
  if (comments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
        This report has not been reviewed yet.
      </p>
    );
  }

  const ordered = comments.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <ol className="space-y-4">
      {ordered.map((comment) => {
        const reviewer = users.find((user) => user.id === comment.authorId);
        const approved = comment.decision === "APPROVED";

        return (
          <li key={comment.id} className="relative flex gap-3 pl-1">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                approved
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
              )}
            >
              {approved ? <CheckCircle2 className="size-4" /> : <Undo2 className="size-4" />}
            </span>

            <div className="min-w-0 flex-1 rounded-lg border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {reviewer ? (
                  <TeamMemberAvatar
                    name={reviewer.fullName}
                    avatarUrl={reviewer.avatarUrl}
                    withName
                    className="size-6"
                  />
                ) : (
                  <p className="text-sm font-medium">Reviewer</p>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-[10px]",
                    approved
                      ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                      : "border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300",
                  )}
                >
                  {REVIEW_DECISION_LABEL[comment.decision]}
                </Badge>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MessageSquare className="size-3" aria-hidden="true" />
                Version {comment.versionNumber} · {relativeTime(comment.createdAt)}
                <span className="hidden sm:inline">({formatDateTime(comment.createdAt)})</span>
              </p>
              <p className="mt-2 whitespace-pre-line text-sm">{comment.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
