import { useState, useEffect, useCallback } from "react";
import type { Report } from "@/types";
import { useApi } from "@/hooks/use-api";

export function useReport(id: string | undefined) {
  const { request } = useApi();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await request<Report>(`/api/reports/${id}`);
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [id, request]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const submitReport = async () => {
    if (!id) return null;
    try {
      const submitted = await request<Report>(`/api/reports/${id}/submit`, { method: "POST" });
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
      await request(`/api/reports/${id}`, { method: "DELETE" });
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
    submitReport,
    deleteReport,
  };
}
