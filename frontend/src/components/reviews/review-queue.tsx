import Link from "next/link";
import { CalendarClock, Clock, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { REPORT_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { ReviewQueueItem } from "@/types";

interface ReviewQueueProps {
  queue: ReviewQueueItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function formatWaiting(hours: number): string {
  if (hours < 1) return "Less than an hour";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function ReviewQueue({ queue, isLoading, error, onRetry }: ReviewQueueProps) {
  if (isLoading) return <LoadingState type="cards" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (queue.length === 0) {
    return (
      <EmptyState
        title="All caught up"
        description="No reports are waiting for review right now. New submissions from your team will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {queue.map((item) => {
        const { report } = item;
        return (
          <Card key={report.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-sm font-semibold">{item.projectName}</CardTitle>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3" aria-hidden="true" />
                    {item.authorName}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {REPORT_STATUS_LABEL[report.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-0">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <CalendarClock className="size-3" aria-hidden="true" />
                  Week of {formatDate(report.week.start)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="size-3" aria-hidden="true" />
                  Waiting {formatWaiting(item.waitingSinceHours)}
                </p>
                <p>
                  Version {report.currentVersion} · {report.completedTasks.length} task
                  {report.completedTasks.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href={`/reviews/${report.id}`}>Review report</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
