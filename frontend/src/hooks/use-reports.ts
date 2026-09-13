import { useState, useEffect, useCallback } from "react";
import type { Report, ReportFilters } from "@/types";
import { reportsService } from "@/services";

export function useReports(initialFilters?: ReportFilters) {
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReports(filters);
      setReports(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load reports.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchReports();
  }, [fetchReports]);

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const deleteReport = async (id: string) => {
    try {
      await reportsService.deleteReport(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete report.";
      setError(msg);
      throw err;
    }
  };

  return {
    reports,
    filters,
    isLoading,
    error,
    refetch: fetchReports,
    updateFilters,
    setFilters,
    deleteReport,
  };
}
