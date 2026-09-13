import { subHours, subMinutes, formatISO } from "date-fns";
import type { ActivityItem, Report, User } from "@/types";

/** Seed activity for the current week, ordered newest first. */
export function createMockActivity(reports: Report[], users: User[]): ActivityItem[] {
  const now = new Date();
  const nameOf = (id: string) => users.find((u) => u.id === id)?.fullName ?? "Someone";
  const latestWeekStart = reports.reduce(
    (latest, report) => (report.week.start > latest ? report.week.start : latest),
    "",
  );
  const findReport = (authorId: string) =>
    reports.find((report) => report.authorId === authorId && report.week.start === latestWeekStart);

  const entries: Array<Omit<ActivityItem, "id" | "actorName"> & { minutesAgo: number }> = [
    {
      kind: "REPORT_SUBMITTED",
      actorId: "u_alex",
      reportId: findReport("u_alex")?.id,
      message: "submitted the weekly report for Client Portal",
      createdAt: "",
      minutesAgo: 10,
    },
    {
      kind: "REPORT_APPROVED",
      actorId: "u_sarah",
      reportId: findReport("u_sarah")?.id,
      message: "had their weekly report approved",
      createdAt: "",
      minutesAgo: 35,
    },
    {
      kind: "CORRECTION_REQUESTED",
      actorId: "u_daniel",
      reportId: findReport("u_daniel")?.id,
      message: "had their report sent back for correction",
      createdAt: "",
      minutesAgo: 60,
    },
    {
      kind: "DRAFT_CREATED",
      actorId: "u_kavindu",
      reportId: findReport("u_kavindu")?.id,
      message: "started a draft report for R&D",
      createdAt: "",
      minutesAgo: 120,
    },
    {
      kind: "REPORT_RESUBMITTED",
      actorId: "u_nethmi",
      message: "resubmitted last week's report after corrections",
      createdAt: "",
      minutesAgo: 300,
    },
  ];

  return entries.map((entry, index) => ({
    id: `act_${index + 1}`,
    kind: entry.kind,
    actorId: entry.actorId,
    actorName: nameOf(entry.actorId),
    reportId: entry.reportId,
    message: entry.message,
    createdAt: formatISO(
      entry.minutesAgo < 60 ? subMinutes(now, entry.minutesAgo) : subHours(now, entry.minutesAgo / 60),
    ),
  }));
}
