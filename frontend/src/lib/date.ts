import { addDays, format, parseISO, startOfWeek } from "date-fns";
import type { WeekRange } from "@/types";

const ISO_DATE = "yyyy-MM-dd";

export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

/** Monday-based week containing the given date. */
export function weekRangeOf(date: Date | string): WeekRange {
  const base = typeof date === "string" ? parseISO(date) : date;
  const start = startOfWeek(base, { weekStartsOn: 1 });
  return { start: toIsoDate(start), end: toIsoDate(addDays(start, 6)) };
}

export function currentWeekRange(): WeekRange {
  return weekRangeOf(new Date());
}

export function shiftWeek(week: WeekRange, weeks: number): WeekRange {
  return weekRangeOf(addDays(parseISO(week.start), weeks * 7));
}

/** "Sep 7 – Sep 13" */
export function formatWeekRange(week: WeekRange): string {
  return `${format(parseISO(week.start), "MMM d")} – ${format(parseISO(week.end), "MMM d")}`;
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy 'at' HH:mm");
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const diffMinutes = Math.round((now.getTime() - parseISO(iso).getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}
