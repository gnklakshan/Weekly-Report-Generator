import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClass?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** Shared shell for every report form section so headings stay consistent. */
export function SectionCard({
  title,
  description,
  icon: Icon,
  iconClass,
  action,
  children,
}: SectionCardProps) {
  return (
    <Card>
      <CardHeader className={action ? "flex flex-row items-start justify-between gap-3 pb-4" : "pb-4"}>
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon ? <Icon className={`size-4 ${iconClass ?? ""}`} aria-hidden="true" /> : null}
            {title}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

/** Placeholder shown inside a section that has no rows yet. */
export function SectionEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}
