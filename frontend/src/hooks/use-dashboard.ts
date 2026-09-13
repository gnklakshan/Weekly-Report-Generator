import { useState, useEffect, useCallback } from "react";
import type { DashboardData, DashboardFilters } from "@/types";
import { dashboardService } from "@/services";

export function useDashboard(initialFilters?: DashboardFilters) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDashboard(filters);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-fetching effect
    void fetchDashboard();
  }, [fetchDashboard]);

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    data,
    filters,
    isLoading,
    error,
    refetch: fetchDashboard,
    updateFilters,
    setFilters,
  };
}
