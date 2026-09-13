import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Noun used in the summary, e.g. "reports" or "projects". */
  itemLabel?: string;
}

/** State-driven pagination — renders buttons, not anchors, since pages are client-side. */
export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "items",
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === pageCount || Math.abs(candidate - page) <= 1,
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{first}</span>–
        <span className="font-medium text-foreground">{last}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((candidate, index) => {
            const previous = pages[index - 1];
            const isGap = previous !== undefined && candidate - previous > 1;
            return (
              <span key={candidate} className="flex items-center gap-1">
                {isGap ? <span className="px-1 text-xs text-muted-foreground">…</span> : null}
                <Button
                  variant={candidate === page ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8 text-xs"
                  aria-label={`Page ${candidate}`}
                  aria-current={candidate === page ? "page" : undefined}
                  onClick={() => onPageChange(candidate)}
                >
                  {candidate}
                </Button>
              </span>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
