import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ACTIVITY_PRESENTATION } from "@/config/activity";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

interface ActivityFeedProps {
  activity: ActivityItem[];
}

/** Recent report events across the team; each links to its report when available. */
export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <Card className="rounded-lg border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Activity
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Report events will appear here as your team submits and reviews."
          />
        ) : (
          <ul className="space-y-0">
            {activity.slice(0, 6).map((item, index) => {
              const presentation = ACTIVITY_PRESENTATION[item.kind];
              const Icon = presentation.icon;
              const body = (
                <div className="flex items-start gap-3 py-3 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-md">
                  <span
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <Icon className={cn("size-3.5", presentation.iconClass)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium text-foreground">
                        {item.actorName}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {item.message}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {relativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={item.id}>
                  {index > 0 && <div className="border-t" />}
                  {item.reportId ? (
                    <Link
                      href={`/reports/${item.reportId}`}
                      className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md"
                    >
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
