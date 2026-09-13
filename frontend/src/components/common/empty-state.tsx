import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-12 text-center shadow-xs">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground mb-4">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="max-w-md text-xs text-muted-foreground mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
