import { Ban, Ellipsis, ShieldCheck, SquarePen, Trash2 } from "lucide-react";

import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { SELF_ACTION_HINT } from "./user-options";
import { UserStatusBadge } from "./user-status-badge";
import type { Project, User } from "@/types";

const MAX_VISIBLE_PROJECTS = 2;

interface UserTableProps {
  users: User[];
  projects: Project[];
  /** Signed-in administrator — their own deactivate/remove actions are disabled. */
  currentUserId?: string;
  isBusy: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({
  users,
  projects,
  currentUserId,
  isBusy,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserTableProps) {
  const projectsOf = (user: User) =>
    user.projectIds
      .map((projectId) => projects.find((project) => project.id === projectId))
      .filter((project): project is Project => Boolean(project));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold">Name</TableHead>
            <TableHead className="text-xs font-semibold">Email</TableHead>
            <TableHead className="text-xs font-semibold">Role</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold">Projects</TableHead>
            <TableHead className="text-xs font-semibold">Joined</TableHead>
            <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isDeactivated = user.status === "DEACTIVATED";
            const assigned = projectsOf(user);

            return (
              <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <TeamMemberAvatar
                    name={user.fullName}
                    avatarUrl={user.avatarUrl}
                    withName
                    jobTitle={user.jobTitle}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  {assigned.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {assigned.slice(0, MAX_VISIBLE_PROJECTS).map((project) => (
                        <span
                          key={project.id}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                        >
                          {project.name}
                        </span>
                      ))}
                      {assigned.length > MAX_VISIBLE_PROJECTS ? (
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          title={assigned
                            .slice(MAX_VISIBLE_PROJECTS)
                            .map((project) => project.name)
                            .join(", ")}
                        >
                          +{assigned.length - MAX_VISIBLE_PROJECTS}
                        </Badge>
                      ) : null}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(user.joinedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={isBusy}
                        aria-label={`Manage ${user.fullName}`}
                      >
                        <Ellipsis className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => onEdit(user)}>
                        <SquarePen className="mr-2 size-4" aria-hidden="true" />
                        Edit role &amp; details
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isSelf} onSelect={() => onToggleStatus(user)}>
                        {isDeactivated ? (
                          <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
                        ) : (
                          <Ban className="mr-2 size-4" aria-hidden="true" />
                        )}
                        {isDeactivated ? "Reactivate account" : "Deactivate account"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        disabled={isSelf}
                        onSelect={() => onDelete(user)}
                      >
                        <Trash2 className="mr-2 size-4" aria-hidden="true" />
                        Remove user
                      </DropdownMenuItem>
                      {isSelf ? (
                        <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                          {SELF_ACTION_HINT}
                        </p>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
