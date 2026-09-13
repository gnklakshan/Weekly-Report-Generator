import { CheckCircle2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportFormValues } from "@/lib/validators";

interface SubmissionSummaryProps {
  projectName?: string;
  weekLabel: string;
  totalLoggedHours: number;
}

/** Read-only recap shown on the final step before submitting. */
export function SubmissionSummary({ projectName, weekLabel, totalLoggedHours }: SubmissionSummaryProps) {
  const { watch } = useFormContext<ReportFormValues>();
  const tasks = watch("completedTasks") ?? [];
  const achievements = watch("achievements") ?? [];
  const blockers = watch("blockers") ?? [];

  const facts = [
    { label: "Project", value: projectName ?? "Not selected" },
    { label: "Week", value: weekLabel },
    { label: "Tasks", value: `${tasks.length} recorded` },
    { label: "Hours", value: `${totalLoggedHours} h` },
  ];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-primary">
          <CheckCircle2 className="size-5" aria-hidden="true" />
          Ready to submit
        </CardTitle>
        <CardDescription>
          Review the summary before sending this report to your manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid grid-cols-2 gap-4 rounded-lg bg-card p-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="truncate font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {achievements.length > 0 ? (
          <div className="rounded-lg bg-card p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Highlights
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {achievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className={achievement.isKeyAchievement ? "font-semibold text-primary" : undefined}
                >
                  {achievement.description || "Untitled highlight"}
                  {achievement.isKeyAchievement ? " (key achievement)" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {blockers.length > 0 ? (
          <div className="rounded-lg bg-card p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blockers raised
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {blockers.map((blocker) => (
                <li key={blocker.id} className={blocker.isKeyIssue ? "font-semibold text-rose-600" : undefined}>
                  {blocker.description || "Untitled blocker"}
                  {blocker.isKeyIssue ? " (key issue)" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
