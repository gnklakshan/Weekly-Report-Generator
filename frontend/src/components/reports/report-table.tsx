import Link from "next/link";
import { Eye, Edit3, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "./report-status-badge";
import type { Project, Report, User } from "@/types";
import { formatWeekRange } from "@/lib/date";

interface ReportTableProps {
  reports: Report[];
  projects: Project[];
  users: User[];
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export function ReportTable({ reports, projects, users, currentUserId, onDelete }: ReportTableProps) {
  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name || "Unassigned";

  const getAuthorName = (authorId: string) =>
    users.find((u) => u.id === authorId)?.fullName || "Unknown";

  const getTotalHours = (r: Report) =>
    Object.values(r.hours).reduce((sum, h) => sum + (Number(h) || 0), 0);

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold">Reporting Week</TableHead>
            <TableHead className="text-xs font-semibold">Author</TableHead>
            <TableHead className="text-xs font-semibold">Project</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold">Tasks</TableHead>
            <TableHead className="text-xs font-semibold">Hours</TableHead>
            <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const isOwner = report.authorId === currentUserId;
            const canEdit = isOwner && (report.status === "DRAFT" || report.status === "NEEDS_CORRECTION");
            const canDelete = isOwner && report.status === "DRAFT";

            return (
              <TableRow key={report.id} className="hover:bg-muted/40 transition-colors">
                <TableCell className="font-medium text-xs">
                  {formatWeekRange(report.week)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {getAuthorName(report.authorId)}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {getProjectName(report.projectId)}
                  </span>
                </TableCell>
                <TableCell className="text-xs">
                  <ReportStatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {report.completedTasks.length} delivered
                </TableCell>
                <TableCell className="text-xs font-mono font-medium">
                  {getTotalHours(report)}h
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="size-8" asChild>
                      <Link href={`/reports/${report.id}`} title="View Report">
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="size-8 text-primary" asChild>
                        <Link href={`/reports/${report.id}/edit`} title="Edit Report">
                          <Edit3 className="size-4" />
                        </Link>
                      </Button>
                    )}
                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(report.id)}
                        title="Delete Draft"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
