import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
  MEDIUM: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  HIGH: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  URGENT:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

/** Priority is conveyed by the text label, never by colour alone. */
export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", PRIORITY_STYLES[priority], className)}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
