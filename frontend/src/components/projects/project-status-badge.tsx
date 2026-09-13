import { Archive, FolderKanban, PauseCircle, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

/** Colour is always paired with an icon and a text label so status is never colour-only. */
const PRESENTATION: Record<ProjectStatus, { className: string; icon: LucideIcon }> = {
  ACTIVE: {
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    icon: FolderKanban,
  },
  ON_HOLD: {
    className:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    icon: PauseCircle,
  },
  ARCHIVED: {
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
    icon: Archive,
  },
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const { className: tone, icon: Icon } = PRESENTATION[status];
  return (
    <Badge variant="outline" className={cn("gap-1", tone, className)}>
      <Icon className="size-3" aria-hidden="true" />
      {PROJECT_STATUS_LABEL[status]}
    </Badge>
  );
}
