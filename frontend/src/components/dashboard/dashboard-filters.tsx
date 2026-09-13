import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { REPORT_STATUSES_WITH_MISSING, REPORT_STATUS_LABEL } from "@/lib/constants";
import { currentWeekRange, weekRangeOf } from "@/lib/date";
import type { DashboardFilters as DashboardFilterValues, ReportStatusOrMissing } from "@/types";
import { FilterSelect, type FilterOption } from "./filter-select";
import { WeekStepper } from "./week-stepper";

type StatusFilter = ReportStatusOrMissing | "ALL";

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  onChange: (partial: Partial<DashboardFilterValues>) => void;
}

/** Filter bar for the team dashboard: week, date range, member, project, status. */
export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const { users, isLoading: usersLoading } = useUsers({ role: "TEAM_MEMBER" });
  const { projects, isLoading: projectsLoading } = useProjects();

  const selectedWeek = filters.weekStart ? weekRangeOf(filters.weekStart) : currentWeekRange();

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
    <Card className="rounded-xl border bg-card">
      <CardContent className="grid gap-5 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reporting week
            </span>
            <WeekStepper week={selectedWeek} onChange={handleWeekChange} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Custom date range
            </span>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-from" className="sr-only">
                From date
              </Label>
              <Input
                id="filter-from"
                type="date"
                className="h-9 w-auto text-sm"
                value={filters.from ?? ""}
                max={filters.to}
                onChange={(event) => onChange({ from: event.target.value || undefined })}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Label htmlFor="filter-to" className="sr-only">
                To date
              </Label>
              <Input
                id="filter-to"
                type="date"
                className="h-9 w-auto text-sm"
                value={filters.to ?? ""}
                min={filters.from}
                onChange={(event) => onChange({ to: event.target.value || undefined })}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
