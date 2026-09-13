import {
  CheckCircle2,
  AlertCircle,
  FilePlus2,
  RefreshCw,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind } from "@/types";

export interface ActivityPresentation {
  icon: LucideIcon;
  /** Tailwind text colour classes, paired with the icon so status is never colour-only. */
  iconClass: string;
}

export const ACTIVITY_PRESENTATION: Record<ActivityKind, ActivityPresentation> = {
  REPORT_SUBMITTED: { icon: Send, iconClass: "text-amber-600" },
  REPORT_APPROVED: { icon: CheckCircle2, iconClass: "text-emerald-600" },
  CORRECTION_REQUESTED: { icon: AlertCircle, iconClass: "text-rose-600" },
  DRAFT_CREATED: { icon: FilePlus2, iconClass: "text-slate-500" },
  REPORT_RESUBMITTED: { icon: RefreshCw, iconClass: "text-sky-600" },
};
