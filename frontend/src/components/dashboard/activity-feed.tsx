import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-xl border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
          Recent activity
        </CardTitle>
        <CardDescription className="text-xs">Latest report events across the team</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Report events will appear here as your team submits and reviews."
          />
        ) : (
          <ul className="-mx-2 space-y-0.5">
            {activity.map((item) => {
              const presentation = ACTIVITY_PRESENTATION[item.kind];
              const Icon = presentation.icon;
              const body = (
                <div className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <Icon className={cn("size-4", presentation.iconClass)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed">
                      <span className="font-medium text-foreground">{item.actorName}</span>{" "}
                      <span className="text-muted-foreground">{item.message}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {relativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={item.id}>
                  {item.reportId ? (
                    <Link
                      href={`/reports/${item.reportId}`}
                      className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
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
