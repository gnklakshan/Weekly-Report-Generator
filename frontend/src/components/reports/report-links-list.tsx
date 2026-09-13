import { ExternalLink, Link2 } from "lucide-react";

import type { ReportLink } from "@/types";

/** Only http(s) targets are rendered as links — anything else stays plain text. */
function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function ReportLinksList({ links }: { links: ReportLink[] }) {
  if (links.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
        No reference links were attached.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => {
        const href = safeHref(link.url);
        return (
          <li key={link.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <Link2 className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{link.label}</p>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                  <span className="truncate">{href}</span>
                  <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <p className="truncate text-xs text-muted-foreground">{link.url}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
