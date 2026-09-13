import { useState } from "react";
import { ChevronDown, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ReportStatusBadge } from "./report-status-badge";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ReportVersion } from "@/types";

interface VersionHistoryProps {
  versions: ReportVersion[];
  currentVersion: number;
}

/** Collapsed by default — submission history is reference material, not the main story. */
export function VersionHistory({ versions, currentVersion }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);

  if (versions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
        This report has not been submitted yet, so there is no version history.
      </p>
    );
  }

  const ordered = versions.slice().sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between" aria-expanded={open}>
          <span className="flex items-center gap-2">
            <History className="size-4" aria-hidden="true" />
            {versions.length} submitted {versions.length === 1 ? "version" : "versions"}
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ol className="mt-3 space-y-2">
          {ordered.map((version) => (
            <li
              key={version.versionNumber}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  Version {version.versionNumber}
                  {version.versionNumber === currentVersion ? (
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      (current)
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Submitted {formatDateTime(version.submittedAt)}
                </p>
              </div>
              <ReportStatusBadge status={version.status} />
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}
