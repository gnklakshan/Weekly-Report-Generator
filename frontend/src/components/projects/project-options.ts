import type { ProjectStatus } from "@/types";

/** Ordered so filter dropdowns and form selects always list statuses the same way. */
export const PROJECT_STATUSES: ProjectStatus[] = ["ACTIVE", "ON_HOLD", "ARCHIVED"];

/** Sentinel used by the status filter — never sent to the service as a real status. */
export const ALL_STATUSES = "ALL";

/** How many member avatars to render before collapsing into a "+n" chip. */
export const MAX_VISIBLE_MEMBERS = 3;

/**
 * Literal class names per `Project.colorToken`. Tailwind v4 scans source for
 * complete class strings, so `bg-${token}` would be purged — the map keeps
 * every candidate present in the compiled stylesheet.
 */
const PROJECT_COLOR_CLASS: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

export function projectColorClass(colorToken: string): string {
  return PROJECT_COLOR_CLASS[colorToken] ?? PROJECT_COLOR_CLASS["chart-1"];
}
