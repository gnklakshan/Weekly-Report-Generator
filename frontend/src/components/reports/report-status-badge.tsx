import { Badge } from "@/components/ui/badge";
import type { ReportStatusOrMissing } from "@/types";
import { REPORT_STATUS_LABEL } from "@/lib/constants";
import { AlertCircle, CheckCircle2, Clock, Edit3, MinusCircle } from "lucide-react";

interface ReportStatusBadgeProps {
  status: ReportStatusOrMissing;
  className?: string;
}

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 ${className ?? ""}`}
        >
          <Edit3 className="size-3 text-slate-500" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 ${className ?? ""}`}
        >
          <Clock className="size-3 text-amber-600" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "NEEDS_CORRECTION":
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 ${className ?? ""}`}
        >
          <AlertCircle className="size-3 text-rose-600" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 ${className ?? ""}`}
        >
          <CheckCircle2 className="size-3 text-emerald-600" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    case "NOT_STARTED":
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 ${className ?? ""}`}
        >
          <MinusCircle className="size-3 text-zinc-400" />
          {REPORT_STATUS_LABEL[status]}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
