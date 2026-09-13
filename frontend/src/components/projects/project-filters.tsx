import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { ALL_STATUSES, PROJECT_STATUSES } from "./project-options";
import type { ProjectFilters, ProjectStatus } from "@/types";

interface ProjectFiltersBarProps {
  filters: ProjectFilters;
  onChange: (updates: Partial<ProjectFilters>) => void;
}

export function ProjectFiltersBar({ filters, onChange }: ProjectFiltersBarProps) {
  const isFiltered = Boolean(filters.search || (filters.status && filters.status !== ALL_STATUSES));

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Label htmlFor="project-search" className="sr-only">
          Search projects
        </Label>
        <Input
          id="project-search"
          placeholder="Search by name or description…"
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value })}
          className="pl-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.status ?? ALL_STATUSES}
          onValueChange={(value) =>
            onChange({ status: value === ALL_STATUSES ? ALL_STATUSES : (value as ProjectStatus) })
          }
        >
          <SelectTrigger className="w-[160px] text-xs" aria-label="Filter by project status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            {PROJECT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PROJECT_STATUS_LABEL[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => onChange({ search: undefined, status: ALL_STATUSES })}
          >
            <X className="mr-1 size-3.5" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
