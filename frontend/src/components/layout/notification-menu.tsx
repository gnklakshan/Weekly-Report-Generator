import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ACTIVITY_PRESENTATION } from "@/config/activity";
import { useApi } from "@/hooks/use-api";
import { relativeTime } from "@/lib/date";
import type { ActivityItem } from "@/types";
import { useEffect, useMemo, useState } from "react";

export function NotificationMenu() {
  const { request } = useApi();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  useEffect(() => {
    let active = true;
    request<ActivityItem[]>("/api/activity?limit=8")
      .then((items) => {
        if (active) setActivity(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [request]);
  const unreadCount = useMemo(
    () =>
      activity.filter(
        (item) =>
          Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000,
      ).length,
    [activity],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold leading-none text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent activity
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {activity.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Nothing has happened yet.
            </p>
          ) : (
            activity.map((item) => {
              const presentation = ACTIVITY_PRESENTATION[item.kind];
              return (
                <DropdownMenuItem key={item.id} asChild className="px-4 py-3">
                  {item.reportId ? (
                    <Link
                      href={`/reports/${item.reportId}`}
                      className="flex gap-3"
                    >
                      <presentation.icon
                        className={`mt-0.5 size-4 shrink-0 ${presentation.iconClass}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs leading-snug">
                          <span className="font-medium">{item.actorName}</span>{" "}
                          {item.message}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {relativeTime(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <presentation.icon
                        className={`mt-0.5 size-4 shrink-0 ${presentation.iconClass}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs leading-snug">
                          <span className="font-medium">{item.actorName}</span>{" "}
                          {item.message}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {relativeTime(item.createdAt)}
                        </span>
                      </span>
                    </div>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
