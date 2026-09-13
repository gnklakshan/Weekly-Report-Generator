import { CheckCircle2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types";

export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
        No highlights were recorded this week.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {achievements.map((achievement) => (
        <li
          key={achievement.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3",
            achievement.isKeyAchievement ? "border-primary/40 bg-primary/5" : "bg-card",
          )}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          >
            <CheckCircle2 className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{achievement.description}</p>
            {achievement.isKeyAchievement ? (
              <Badge
                variant="outline"
                className="mt-1.5 gap-1 border-primary/40 text-[10px] text-primary"
              >
                <Star className="size-3" aria-hidden="true" />
                Key achievement
              </Badge>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
