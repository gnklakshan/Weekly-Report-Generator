import { AlertTriangle, CheckCircle2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Blocker } from "@/types";

/**
 * `resolved` marks a report that has been approved, where the blockers are no
 * longer open. The state is stated in text as well as colour.
 */
export function BlockerList({
  blockers,
  resolved = false,
}: {
  blockers: Blocker[];
  resolved?: boolean;
}) {
  if (blockers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
        No blockers were reported this week.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {blockers.map((blocker) => (
        <li
          key={blocker.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3",
            blocker.isKeyIssue
              ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950"
              : "bg-card",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
              resolved
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
            )}
          >
            {resolved ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{blocker.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {blocker.isKeyIssue ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-rose-300 text-[10px] text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  <Star className="size-3" aria-hidden="true" />
                  Key issue
                </Badge>
              ) : null}
              <span className="text-[11px] text-muted-foreground">
                {resolved ? "Resolved — report approved" : "Open"}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
