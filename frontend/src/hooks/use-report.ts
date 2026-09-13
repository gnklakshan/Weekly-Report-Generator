import { useState, useEffect, useCallback } from "react";
import type { Report, UpdateReportInput } from "@/types";
import { reportsService } from "@/services";

export function useReport(id: string | undefined) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReport(id);
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load report.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchReport();
  }, [fetchReport]);

  const updateReport = async (input: UpdateReportInput) => {
    if (!id) return null;
    try {
      const updated = await reportsService.updateReport(id, input);
      setReport(updated);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update report.";
      setError(msg);
      throw err;
    }
  };

  const submitReport = async () => {
    if (!id) return null;
    try {
      const submitted = await reportsService.submitReport(id);
      setReport(submitted);
      return submitted;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit report.";
      setError(msg);
      throw err;
    }
  };

  const deleteReport = async () => {
    if (!id) return;
    try {
      await reportsService.deleteReport(id);
      setReport(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete report.";
      setError(msg);
      throw err;
    }
  };

  return {
    report,
    isLoading,
    error,
    refetch: fetchReport,
    updateReport,
    submitReport,
    deleteReport,
  };
}
