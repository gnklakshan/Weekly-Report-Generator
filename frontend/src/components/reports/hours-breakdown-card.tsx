import type { ReportHourBreakdown } from "@/types";
import { TASK_TYPES, TASK_TYPE_LABEL } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

interface HoursBreakdownCardProps {
  hours: ReportHourBreakdown;
}

export function HoursBreakdownCard({ hours }: HoursBreakdownCardProps) {
  const total = TASK_TYPES.reduce((sum, type) => sum + (Number(hours[type]) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs border-b pb-2">
        <span className="font-semibold text-muted-foreground uppercase tracking-wider">Activity</span>
        <span className="font-semibold text-foreground">Total: {total} Hours</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TASK_TYPES.map((type) => {
          const val = Number(hours[type]) || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={type} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{TASK_TYPE_LABEL[type]}</span>
                <span className="font-mono text-muted-foreground">
                  {val}h ({pct}%)
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
