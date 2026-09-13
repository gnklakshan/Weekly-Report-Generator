import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date";
import { MemberAvatarGroup } from "./member-avatar-group";
import { projectColorClass } from "./project-options";
import { ProjectStatusBadge } from "./project-status-badge";
import type { Project, User } from "@/types";

interface ProjectTableProps {
  projects: Project[];
  users: User[];
  /** Team members see the same table without the management actions. */
  canManage: boolean;
  isBusy: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectTable({
  projects,
  users,
  canManage,
  isBusy,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  const membersOf = (project: Project) =>
    project.memberIds
      .map((memberId) => users.find((user) => user.id === memberId))
      .filter((user): user is User => Boolean(user));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold">Name</TableHead>
            <TableHead className="text-xs font-semibold">Description</TableHead>
            <TableHead className="text-xs font-semibold">Members</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold">Created</TableHead>
            {canManage ? (
              <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/40 transition-colors">
              <TableCell className="text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full ${projectColorClass(project.colorToken)}`}
                  />
                  {project.name}
                </span>
              </TableCell>
              <TableCell className="max-w-[22rem] text-xs text-muted-foreground">
                <span className="line-clamp-2 block" title={project.description}>
                  {project.description}
                </span>
              </TableCell>
              <TableCell>
                <MemberAvatarGroup members={membersOf(project)} />
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(project.createdAt)}
              </TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-primary"
                          disabled={isBusy}
                          aria-label={`Edit ${project.name}`}
                          onClick={() => onEdit(project)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Edit project</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          disabled={isBusy}
                          aria-label={`Delete ${project.name}`}
                          onClick={() => onDelete(project)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Delete project</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
