import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type MetricTone = "default" | "positive" | "warning" | "destructive";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Short supporting line; keep it derived from real data, never a fabricated stat. */
  hint?: string;
  /** Optional period-over-period change, e.g. "+12% vs last week". */
  delta?: string;
  tone?: MetricTone;
  loading?: boolean;
}

const TONE_CLASS: Record<MetricTone, string> = {
  default: "bg-muted text-muted-foreground",
  positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  destructive: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
};

/** Single KPI tile. Value and hint are always supplied by the caller from derived data. */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  tone = "default",
  loading = false,
}: MetricCardProps) {
  return (
    <Card className="rounded-xl border bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", TONE_CLASS[tone])}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
            {delta ? <p className="mt-1 text-xs font-medium text-muted-foreground">{delta}</p> : null}
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
