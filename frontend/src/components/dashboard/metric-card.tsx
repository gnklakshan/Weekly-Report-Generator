import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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

const TONE_BORDER: Record<MetricTone, string> = {
  default: "border-l-border",
  positive: "border-l-emerald-500",
  warning: "border-l-amber-500",
  destructive: "border-l-rose-500",
};

const TONE_ICON: Record<MetricTone, string> = {
  default: "text-muted-foreground",
  positive: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  destructive: "text-rose-600 dark:text-rose-400",
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
    <Card
      className={cn(
        "rounded-lg border border-l-[3px] bg-card",
        TONE_BORDER[tone],
      )}
    >
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Icon
                className={cn("size-4", TONE_ICON[tone])}
                aria-hidden="true"
              />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </span>
            </div>
            <div className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </div>
            {delta ? (
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                {delta}
              </p>
            ) : null}
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
