import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/use-api";
import { useEffect, useState } from "react";
import {
  REPORT_STATUSES_WITH_MISSING,
  REPORT_STATUS_LABEL,
} from "@/lib/constants";
import { currentWeekRange, weekRangeOf } from "@/lib/date";
import type {
  DashboardFilters as DashboardFilterValues,
  ReportStatusOrMissing,
} from "@/types";
import { FilterSelect, type FilterOption } from "./filter-select";
import { WeekStepper } from "./week-stepper";

type StatusFilter = ReportStatusOrMissing | "ALL";

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  onChange: (partial: Partial<DashboardFilterValues>) => void;
}

/** Filter bar for the team dashboard: week, date range, member, project, status. */
export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const { request } = useApi();
  const [users, setUsers] = useState<import("@/types").User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [projects, setProjects] = useState<import("@/types").Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({ role: "TEAM_MEMBER" });
    request<import("@/types").User[]>(`/api/users?${query}`)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [request]);

  useEffect(() => {
    request<import("@/types").Project[]>("/api/projects")
      .then(setProjects)
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, [request]);

  const selectedWeek = filters.weekStart
    ? weekRangeOf(filters.weekStart)
    : currentWeekRange();

  const memberOptions: FilterOption<string>[] = [
    { value: "ALL", label: "All members" },
    ...users.map((user) => ({ value: user.id, label: user.fullName })),
  ];
  const projectOptions: FilterOption<string>[] = [
    { value: "ALL", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];
  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: "ALL", label: "All statuses" },
    ...REPORT_STATUSES_WITH_MISSING.map((status) => ({
      value: status,
      label: REPORT_STATUS_LABEL[status],
    })),
  ];

  // Stepping the week clears any manual range so the week selection takes effect.
  function handleWeekChange(weekStart: string) {
    onChange({ weekStart, from: undefined, to: undefined });
  }

  return (
    <Card className="rounded-lg border bg-card">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Reporting week
            </span>
            <WeekStepper week={selectedWeek} onChange={handleWeekChange} />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="filter-from"
                className="text-xs font-medium text-muted-foreground"
              >
                From
              </Label>
              <Input
                id="filter-from"
                type="date"
                className="h-9 w-[140px] text-sm"
                value={filters.from ?? ""}
                max={filters.to}
                onChange={(event) =>
                  onChange({ from: event.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="filter-to"
                className="text-xs font-medium text-muted-foreground"
              >
                To
              </Label>
              <Input
                id="filter-to"
                type="date"
                className="h-9 w-[140px] text-sm"
                value={filters.to ?? ""}
                min={filters.from}
                onChange={(event) =>
                  onChange({ to: event.target.value || undefined })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:mt-4">
          <FilterSelect
            id="filter-member"
            label="Team member"
            value={filters.memberId ?? "ALL"}
            options={memberOptions}
            onChange={(memberId) => onChange({ memberId })}
            disabled={usersLoading}
          />
          <FilterSelect
            id="filter-project"
            label="Project"
            value={filters.projectId ?? "ALL"}
            options={projectOptions}
            onChange={(projectId) => onChange({ projectId })}
            disabled={projectsLoading}
          />
          <FilterSelect
            id="filter-status"
            label="Report status"
            value={filters.status ?? "ALL"}
            options={statusOptions}
            onChange={(status) => onChange({ status })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
