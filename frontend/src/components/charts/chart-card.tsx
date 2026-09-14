import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  /** Optional slot for controls such as a segmented toggle. */
  action?: ReactNode;
  /** Renders a skeleton in place of the chart while data loads. */
  loading?: boolean;
  /** Renders the empty fallback instead of an empty axis when true. */
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Shared shell for every dashboard chart: consistent header, loading skeleton
 * and empty-state fallback so individual charts stay focused on their config.
 */
export function ChartCard({
  title,
  description,
  action,
  loading = false,
  isEmpty = false,
  emptyMessage = "No data for the selected filters.",
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("rounded-lg border bg-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-sm font-medium text-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton
            className="aspect-video w-full rounded-lg"
            aria-label={`Loading ${title}`}
          />
        ) : isEmpty ? (
          <div className="aspect-video w-full [&>div]:h-full [&>div]:justify-center">
            <EmptyState
              icon={BarChart3}
              title="No data"
              description={emptyMessage}
            />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
