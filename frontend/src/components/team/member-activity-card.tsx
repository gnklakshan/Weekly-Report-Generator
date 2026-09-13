import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_PRESENTATION } from "@/config/activity";
import { relativeTime } from "@/lib/date";
import type { MemberActivityEntry } from "./member-metrics";

/** Newest-first trail of what this member has done, rebuilt from their own reports. */
export function MemberActivityCard({ entries }: { entries: MemberActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription className="text-xs">
          Drafts, submissions and review outcomes for this member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-xs italic text-muted-foreground">
            <Activity className="size-4" aria-hidden="true" />
            No activity recorded yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const presentation = ACTIVITY_PRESENTATION[entry.kind];
              const Icon = presentation.icon;
              return (
                <li key={entry.id} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ${presentation.iconClass}`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/reports/${entry.reportId}`}
                      className="block truncate text-xs font-medium hover:text-primary hover:underline"
                      title={entry.message}
                    >
                      {entry.message}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {relativeTime(entry.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
