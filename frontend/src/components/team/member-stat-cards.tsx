import { FileText, ListChecks, Percent, Timer, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { TeamMemberStats } from "@/types";

interface StatItem {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

/** Four headline figures for the current week; every value comes from TeamMemberStats. */
export function MemberStatCards({ stats }: { stats: TeamMemberStats | null }) {
  const items: StatItem[] = [
    {
      label: "Reports submitted",
      value: stats ? String(stats.reportsSubmitted) : "—",
      hint: "Excludes drafts",
      icon: FileText,
    },
    {
      label: "Approval rate",
      value: stats ? `${stats.approvalRate}%` : "—",
      hint: "Approved of submitted",
      icon: Percent,
    },
    {
      label: "Average hours",
      value: stats ? `${stats.averageHours}h` : "—",
      hint: "Per filed report",
      icon: Timer,
    },
    {
      label: "Tasks completed",
      value: stats ? String(stats.tasksCompleted) : "—",
      hint: "This week",
      icon: ListChecks,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-start gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.hint}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
