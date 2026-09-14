import { Badge } from "@/components/ui/badge";
import type { ReportStatusOrMissing } from "@/types";
import { REPORT_STATUS_LABEL } from "@/lib/constants";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  MinusCircle,
} from "lucide-react";

interface ReportStatusBadgeProps {
  status: ReportStatusOrMissing;
  className?: string;
}

export function ReportStatusBadge({
  status,
  className,
}: ReportStatusBadgeProps) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 ${className ?? ""}`}
        >
          <Edit3 className="size-3" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 ${className ?? ""}`}
        >
          <Clock className="size-3" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "NEEDS_CORRECTION":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 ${className ?? ""}`}
        >
          <AlertCircle className="size-3" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 ${className ?? ""}`}
        >
          <CheckCircle2 className="size-3" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "NOT_STARTED":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 ${className ?? ""}`}
        >
          <MinusCircle className="size-3" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
