import { useCallback, useEffect, useState, type ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RequirePermission } from "@/components/layout/require-permission";
import { ReviewQueue } from "@/components/reviews/review-queue";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import type { ReviewQueueItem } from "@/types";

export default function ReviewsPage() {
  const { user } = useAuth();
  const { request } = useApi();
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setQueue(
        await request<ReviewQueueItem[]>(
          user?.id ? `/api/reviews?reviewerId=${user.id}` : "/api/reviews",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load review queue.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [request, user?.id]);
  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <RequirePermission permissions={["REVIEW_REPORT"]}>
      <PageHeader
        title="Reviews"
        description="Reports submitted by your team awaiting your review."
      />
      <ReviewQueue
        queue={queue}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </RequirePermission>
  );
}

ReviewsPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
