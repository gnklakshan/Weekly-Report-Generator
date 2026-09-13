import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  rows?: number;
  type?: "table" | "cards" | "detail";
}

export function LoadingState({ rows = 4, type = "table" }: LoadingStateProps) {
  if (type === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-6">
      <Skeleton className="h-8 w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
