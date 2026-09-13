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
import { ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/constants";
import { ALL, USER_ROLES, USER_STATUSES } from "./user-options";
import type { UserFilters, UserRole, UserStatus } from "@/types";

interface UserFiltersBarProps {
  filters: UserFilters;
  onChange: (updates: Partial<UserFilters>) => void;
}

export function UserFiltersBar({ filters, onChange }: UserFiltersBarProps) {
  const isFiltered =
    Boolean(filters.search) ||
    Boolean(filters.role && filters.role !== ALL) ||
    Boolean(filters.status && filters.status !== ALL);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Label htmlFor="user-search" className="sr-only">
          Search people
        </Label>
        <Input
          id="user-search"
          placeholder="Search by name or email…"
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value })}
          className="pl-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.role ?? ALL}
          onValueChange={(value) => onChange({ role: value === ALL ? ALL : (value as UserRole) })}
        >
          <SelectTrigger className="w-[150px] text-xs" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All roles</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABEL[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) =>
            onChange({ status: value === ALL ? ALL : (value as UserStatus) })
          }
        >
          <SelectTrigger className="w-[150px] text-xs" aria-label="Filter by account status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {USER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {USER_STATUS_LABEL[status]}
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
            onClick={() => onChange({ search: undefined, role: ALL, status: ALL })}
          >
            <X className="mr-1 size-3.5" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
