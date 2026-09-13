import { FolderKanban } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { projectColorClass } from "@/components/projects/project-options";
import type { MemberProjectSummary } from "./member-metrics";

/** Workload this member has recorded against each project they are assigned to. */
export function MemberProjectsCard({ summaries }: { summaries: MemberProjectSummary[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Project workload</CardTitle>
        <CardDescription className="text-xs">
          Hours and completed tasks recorded across every report this member has filed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summaries.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-xs italic text-muted-foreground">
            <FolderKanban className="size-4" aria-hidden="true" />
            No project assignments yet.
          </p>
        ) : (
          <ul className="divide-y">
            {summaries.map(({ project, reports, hours, tasksCompleted }) => (
              <li key={project.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${projectColorClass(project.colorToken)}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{project.description}</p>
                </div>
                <ProjectStatusBadge status={project.status} />
                <dl className="flex shrink-0 items-center gap-4 text-xs">
                  <div className="text-right">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Reports
                    </dt>
                    <dd className="font-mono font-semibold tabular-nums">{reports}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Hours
                    </dt>
                    <dd className="font-mono font-semibold tabular-nums">{hours}h</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Tasks
                    </dt>
                    <dd className="font-mono font-semibold tabular-nums">{tasksCompleted}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
