import { CircleCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatWeekRange, weekRangeOf } from "@/lib/date";
import type { MemberBlocker } from "./member-metrics";
import type { Project } from "@/types";

interface MemberBlockersCardProps {
  blockers: MemberBlocker[];
  projects: Project[];
}

/** Every blocker this member has reported, newest week first, with its open/resolved state. */
export function MemberBlockersCard({ blockers, projects }: MemberBlockersCardProps) {
  const openCount = blockers.filter((blocker) => blocker.isOpen).length;
  const projectNameOf = (projectId: string) =>
    projects.find((project) => project.id === projectId)?.name ?? "Unassigned";

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Blockers</CardTitle>
        <CardDescription className="text-xs">
          {blockers.length === 0
            ? "Nothing has blocked this member so far."
            : `${openCount} open of ${blockers.length} reported. A blocker stays open until its report is approved.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blockers.length === 0 ? (
          <p className="py-2 text-xs italic text-muted-foreground">No blockers reported.</p>
        ) : (
          <ul className="space-y-2">
            {blockers.map((blocker) => (
              <li key={blocker.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start gap-2.5">
                  {blocker.isOpen ? (
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  ) : (
                    <CircleCheck
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{blocker.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatWeekRange(weekRangeOf(blocker.weekStart))} ·{" "}
                      {projectNameOf(blocker.projectId)} ·{" "}
                      <span className={cn(blocker.isOpen && "font-medium text-destructive")}>
                        {blocker.isOpen ? "Open" : "Resolved"}
                      </span>
                    </p>
                  </div>
                  {blocker.isKeyIssue ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Key issue
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
