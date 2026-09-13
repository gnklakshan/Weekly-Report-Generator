import { CircleSlash, CircleUserRound, ShieldCheck, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { USER_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types";

/** Colour is always paired with an icon and a text label so status is never colour-only. */
const PRESENTATION: Record<UserStatus, { className: string; icon: LucideIcon }> = {
  ACTIVE: {
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    icon: CircleUserRound,
  },
  INVITED: {
    className:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
    icon: ShieldCheck,
  },
  DEACTIVATED: {
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
    icon: CircleSlash,
  },
};

export function UserStatusBadge({
  status,
  className,
}: {
  status: UserStatus;
  className?: string;
}) {
  const { className: tone, icon: Icon } = PRESENTATION[status];
  return (
    <Badge variant="outline" className={cn("gap-1", tone, className)}>
      <Icon className="size-3" aria-hidden="true" />
      {USER_STATUS_LABEL[status]}
    </Badge>
  );
}
