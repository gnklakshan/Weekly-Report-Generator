import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-xs text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 size-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
