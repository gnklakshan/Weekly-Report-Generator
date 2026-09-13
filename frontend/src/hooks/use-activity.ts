import { useEffect, useMemo, useState } from "react";
import { dashboardService } from "@/services";
import type { ActivityItem } from "@/types";

/**
 * Powers the header notification indicator. A real backend would expose an
 * unread-count endpoint; here the count is derived from recent activity.
 */
export function useActivity(limit = 8) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void dashboardService.getActivity(limit).then((items) => {
      if (!active) return;
      setActivity(items);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [limit]);

  const unreadCount = useMemo(
    () => activity.filter(
      // eslint-disable-next-line react-hooks/purity -- derived computation using current time
      (item) => Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000,
    ).length,
    [activity],
  );

  return { activity, unreadCount, isLoading };
}
