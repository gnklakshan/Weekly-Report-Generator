import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, ReportFilters, ReportStatus, User } from "@/types";
import { REPORT_STATUSES, REPORT_STATUS_LABEL } from "@/lib/constants";

const ALL = "ALL";

interface ReportFiltersBarProps {
  filters: ReportFilters;
  projects: Project[];
  /** Provided on manager/admin views, where reports from anyone can be listed. */
  users?: User[];
  onFilterChange: (updates: Partial<ReportFilters>) => void;
}

export function ReportFiltersBar({
  filters,
  projects,
  users,
  onFilterChange,
}: ReportFiltersBarProps) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-2.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Label htmlFor="report-search" className="sr-only">
            Search reports
          </Label>
          <Input
            id="report-search"
            placeholder="Search by task title, notes, blockers…"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status ?? ALL}
            onValueChange={(value) =>
              onFilterChange({
                status: value === ALL ? undefined : (value as ReportStatus),
              })
            }
          >
            <SelectTrigger className="w-[150px] text-xs" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {REPORT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {REPORT_STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.projectId ?? ALL}
            onValueChange={(value) => onFilterChange({ projectId: value })}
          >
            <SelectTrigger className="w-[160px] text-xs" aria-label="Filter by project">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {users ? (
            <Select
              value={filters.authorId ?? ALL}
              onValueChange={(value) => onFilterChange({ authorId: value === ALL ? undefined : value })}
            >
              <SelectTrigger className="w-[160px] text-xs" aria-label="Filter by team member">
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All members</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t pt-3">
        <div className="space-y-1">
          <Label htmlFor="report-from" className="text-[11px] text-muted-foreground">
            Weeks starting on or after
          </Label>
          <Input
            id="report-from"
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => onFilterChange({ from: e.target.value || undefined })}
            className="h-8 w-[160px] text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="report-to" className="text-[11px] text-muted-foreground">
            Weeks ending on or before
          </Label>
          <Input
            id="report-to"
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => onFilterChange({ to: e.target.value || undefined })}
            className="h-8 w-[160px] text-xs"
          />
        </div>
      </div>
    </div>
  );
}
