import { useState, useEffect, useCallback } from "react";
import type { ApproveReviewInput, RequestCorrectionInput, ReviewQueueItem } from "@/types";
import { reviewsService } from "@/services";

export function useReview(reviewerId?: string) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await reviewsService.getReviewQueue(reviewerId || "");
      setQueue(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load review queue.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [reviewerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchQueue();
  }, [fetchQueue]);

  const approveReport = async (input: ApproveReviewInput) => {
    try {
      const updated = await reviewsService.approveReport(input);
      setQueue((prev) => prev.filter((q) => q.report.id !== input.reportId));
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve report.";
      setError(msg);
      throw err;
    }
  };

  const requestCorrection = async (input: RequestCorrectionInput) => {
    try {
      const updated = await reviewsService.requestCorrection(input);
      setQueue((prev) => prev.filter((q) => q.report.id !== input.reportId));
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to request correction.";
      setError(msg);
      throw err;
    }
  };

  return {
    queue,
    isLoading,
    error,
    refetch: fetchQueue,
    approveReport,
    requestCorrection,
  };
}
