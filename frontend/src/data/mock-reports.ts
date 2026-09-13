import { addDays, formatISO, parseISO, subWeeks } from "date-fns";
import type {
  Achievement,
  Blocker,
  PlannedTask,
  Report,
  ReportHourBreakdown,
  ReportStatus,
  ReportTask,
  ReviewComment,
  WeekRange,
} from "@/types";
import { currentWeekRange, weekRangeOf } from "@/lib/date";

/** DEMO DATA — several weeks of reports across statuses and projects. */

interface SeedTask {
  title: string;
  output: string;
  priority: ReportTask["priority"];
  status: ReportTask["status"];
  plannedPercent: number;
  actualPercent: number;
  plannedHours: number;
  spentHours: number;
}

interface ReportSeed {
  authorId: string;
  projectId: string;
  weeksAgo: number;
  status: ReportStatus;
  tasks: SeedTask[];
  nextWeek: string[];
  blockers: Array<{ text: string; key?: boolean }>;
  achievements: Array<{ text: string; key?: boolean }>;
  hours: ReportHourBreakdown;
  notes: string;
  reviewMessage?: string;
  versionsCount?: number;
}

const hours = (
  dev: number,
  test: number,
  meet: number,
  docs: number,
  other: number,
): ReportHourBreakdown => ({
  DEVELOPMENT: dev,
  TESTING: test,
  MEETINGS: meet,
  DOCUMENTATION: docs,
  OTHER: other,
});

const task = (
  title: string,
  output: string,
  priority: SeedTask["priority"],
  status: SeedTask["status"],
  plannedPercent: number,
  actualPercent: number,
  plannedHours: number,
  spentHours: number,
): SeedTask => ({
  title,
  output,
  priority,
  status,
  plannedPercent,
  actualPercent,
  plannedHours,
  spentHours,
});

const seeds: ReportSeed[] = [
  {
    authorId: "u_alex",
    projectId: "p_client_portal",
    weeksAgo: 0,
    status: "SUBMITTED",
    tasks: [
      task(
        "Invoice list virtualization",
        "PR #482 merged",
        "HIGH",
        "COMPLETED",
        100,
        100,
        12,
        11.5,
      ),
      task("Portal settings redesign", "Figma handoff applied", "MEDIUM", "IN_PROGRESS", 80, 60, 10, 9),
      task("Accessibility audit fixes", "14 issues resolved", "MEDIUM", "COMPLETED", 100, 100, 6, 7),
    ],
    nextWeek: ["Ship settings redesign", "Start billing history filters"],
    blockers: [{ text: "Waiting on final invoice API contract from platform team", key: true }],
    achievements: [{ text: "Cut invoice list render time by 60%", key: true }],
    hours: hours(22, 4, 5, 3, 2),
    notes: "Settings redesign slipped slightly due to the audit fixes taking priority.",
  },
  {
    authorId: "u_sarah",
    projectId: "p_client_portal",
    weeksAgo: 0,
    status: "APPROVED",
    tasks: [
      task("Invoice API v2 endpoints", "3 endpoints live in staging", "URGENT", "COMPLETED", 100, 100, 16, 15),
      task("Payment webhook retries", "Retry queue deployed", "HIGH", "COMPLETED", 100, 100, 8, 9),
      task("Query performance tuning", "p95 down to 180ms", "MEDIUM", "COMPLETED", 90, 100, 6, 6),
    ],
    nextWeek: ["Contract tests for invoice API", "Support portal pagination"],
    blockers: [],
    achievements: [{ text: "Invoice API v2 shipped a week early", key: true }],
    hours: hours(24, 6, 4, 4, 2),
    notes: "Ready for frontend integration.",
    reviewMessage: "Great throughput this week, and the early API delivery unblocks Alex.",
  },
  {
    authorId: "u_daniel",
    projectId: "p_mobile_app",
    weeksAgo: 0,
    status: "NEEDS_CORRECTION",
    tasks: [
      task("Regression suite for release 3.2", "42 cases executed", "HIGH", "IN_PROGRESS", 100, 70, 14, 12),
      task("Crash triage", "6 crashes reproduced", "MEDIUM", "COMPLETED", 100, 100, 6, 7),
    ],
    nextWeek: ["Finish regression suite", "Automate smoke tests"],
    blockers: [
      { text: "Test devices unavailable for two days", key: true },
      { text: "Flaky login test blocking CI" },
    ],
    achievements: [{ text: "Reduced manual smoke pass to 40 minutes" }],
    hours: hours(4, 18, 5, 3, 2),
    notes: "Release readiness call scheduled for Monday.",
    reviewMessage:
      "Please provide more detail about the API integration testing and update the actual completion percentage for the regression suite.",
    versionsCount: 1,
  },
  {
    authorId: "u_kavindu",
    projectId: "p_rnd",
    weeksAgo: 0,
    status: "DRAFT",
    tasks: [
      task("Event pipeline prototype", "Draft DAG running locally", "MEDIUM", "IN_PROGRESS", 60, 40, 12, 8),
      task("Warehouse cost review", "Draft findings doc", "LOW", "IN_PROGRESS", 50, 30, 6, 4),
    ],
    nextWeek: ["Benchmark pipeline throughput"],
    blockers: [{ text: "Warehouse sandbox quota exhausted" }],
    achievements: [],
    hours: hours(12, 2, 3, 4, 1),
    notes: "Still collecting numbers before submitting.",
  },
  // Nethmi intentionally has no report for the current week (NOT_STARTED).
  {
    authorId: "u_alex",
    projectId: "p_internal_tooling",
    weeksAgo: 1,
    status: "APPROVED",
    tasks: [
      task("Ops console filters", "Released to internal users", "HIGH", "COMPLETED", 100, 100, 14, 13),
      task("Bulk action UX", "Shipped behind flag", "MEDIUM", "COMPLETED", 100, 100, 8, 9),
    ],
    nextWeek: ["Client portal invoice work"],
    blockers: [],
    achievements: [{ text: "Support team saved ~3 hours per day", key: true }],
    hours: hours(20, 3, 6, 3, 2),
    notes: "",
    reviewMessage: "Clear write-up, thanks.",
  },
  {
    authorId: "u_sarah",
    projectId: "p_rnd",
    weeksAgo: 1,
    status: "APPROVED",
    tasks: [
      task("Caching spike", "Spike report published", "MEDIUM", "COMPLETED", 100, 100, 10, 10),
      task("Auth token rotation", "Design doc approved", "HIGH", "COMPLETED", 100, 100, 10, 11),
    ],
    nextWeek: ["Invoice API v2"],
    blockers: [{ text: "Security review scheduling delays" }],
    achievements: [{ text: "Caching spike found 35% latency win" }],
    hours: hours(18, 4, 6, 5, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_nethmi",
    projectId: "p_mobile_app",
    weeksAgo: 1,
    status: "APPROVED",
    tasks: [
      task("Onboarding flow redesign", "Prototype shared", "HIGH", "COMPLETED", 100, 100, 16, 15),
      task("Design token cleanup", "Library updated", "LOW", "COMPLETED", 80, 100, 6, 5),
    ],
    nextWeek: ["Usability sessions", "Marketing landing refresh"],
    blockers: [],
    achievements: [{ text: "Onboarding prototype tested with 5 users", key: true }],
    hours: hours(6, 2, 8, 6, 12),
    notes: "",
    reviewMessage: "Nice work on the usability sessions.",
  },
  {
    authorId: "u_daniel",
    projectId: "p_internal_tooling",
    weeksAgo: 1,
    status: "APPROVED",
    tasks: [
      task("Ops console test plan", "Plan reviewed", "MEDIUM", "COMPLETED", 100, 100, 8, 8),
      task("Automated API checks", "12 checks in CI", "HIGH", "COMPLETED", 100, 100, 12, 13),
    ],
    nextWeek: ["Mobile regression suite"],
    blockers: [],
    achievements: [{ text: "CI now catches broken endpoints before release" }],
    hours: hours(5, 16, 4, 4, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_kavindu",
    projectId: "p_marketing",
    weeksAgo: 1,
    status: "SUBMITTED",
    tasks: [
      task("Campaign event schema", "Schema v1 documented", "MEDIUM", "COMPLETED", 100, 90, 10, 11),
      task("Attribution dashboard", "First charts wired", "MEDIUM", "IN_PROGRESS", 70, 55, 10, 8),
    ],
    nextWeek: ["Finish attribution dashboard"],
    blockers: [{ text: "Missing historical campaign data export", key: true }],
    achievements: [],
    hours: hours(14, 3, 4, 5, 2),
    notes: "",
  },
  {
    authorId: "u_alex",
    projectId: "p_client_portal",
    weeksAgo: 2,
    status: "APPROVED",
    tasks: [
      task("Portal auth refresh", "Released", "URGENT", "COMPLETED", 100, 100, 18, 17),
      task("Error boundary coverage", "All routes covered", "MEDIUM", "COMPLETED", 100, 100, 6, 6),
    ],
    nextWeek: ["Ops console filters"],
    blockers: [],
    achievements: [{ text: "Session drop-offs down 22%", key: true }],
    hours: hours(21, 4, 5, 2, 1),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_sarah",
    projectId: "p_client_portal",
    weeksAgo: 2,
    status: "APPROVED",
    tasks: [
      task("Invoice data migration", "Migration dry run complete", "HIGH", "COMPLETED", 100, 100, 14, 15),
      task("Audit logging", "Logs shipped to warehouse", "MEDIUM", "COMPLETED", 100, 100, 8, 7),
    ],
    nextWeek: ["Caching spike"],
    blockers: [],
    achievements: [{ text: "Zero-downtime migration rehearsal" }],
    hours: hours(19, 5, 4, 4, 1),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_nethmi",
    projectId: "p_marketing",
    weeksAgo: 2,
    status: "APPROVED",
    tasks: [
      task("Lifecycle email templates", "6 templates delivered", "MEDIUM", "COMPLETED", 100, 100, 12, 12),
    ],
    nextWeek: ["Onboarding redesign"],
    blockers: [{ text: "Brand guidelines still in review" }],
    achievements: [],
    hours: hours(2, 1, 6, 5, 10),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_daniel",
    projectId: "p_mobile_app",
    weeksAgo: 2,
    status: "APPROVED",
    tasks: [
      task("Release 3.1 verification", "Signed off", "HIGH", "COMPLETED", 100, 100, 16, 16),
    ],
    nextWeek: ["Ops console test plan"],
    blockers: [],
    achievements: [{ text: "Release 3.1 shipped with no hotfixes", key: true }],
    hours: hours(3, 18, 4, 3, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_kavindu",
    projectId: "p_rnd",
    weeksAgo: 2,
    status: "APPROVED",
    tasks: [
      task("Data quality checks", "8 checks automated", "MEDIUM", "COMPLETED", 100, 100, 12, 13),
    ],
    nextWeek: ["Campaign event schema"],
    blockers: [],
    achievements: [{ text: "Pipeline failures now alert within 5 minutes" }],
    hours: hours(15, 4, 3, 4, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_alex",
    projectId: "p_internal_tooling",
    weeksAgo: 3,
    status: "APPROVED",
    tasks: [task("Design system upgrade", "Tokens migrated", "MEDIUM", "COMPLETED", 100, 100, 16, 16)],
    nextWeek: ["Portal auth refresh"],
    blockers: [],
    achievements: [{ text: "Removed 1.2k lines of legacy CSS" }],
    hours: hours(20, 3, 4, 4, 1),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_sarah",
    projectId: "p_rnd",
    weeksAgo: 3,
    status: "APPROVED",
    tasks: [task("Search relevance spike", "Findings documented", "LOW", "COMPLETED", 100, 100, 12, 11)],
    nextWeek: ["Invoice data migration"],
    blockers: [],
    achievements: [],
    hours: hours(16, 4, 5, 5, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
  {
    authorId: "u_nethmi",
    projectId: "p_mobile_app",
    weeksAgo: 3,
    status: "NEEDS_CORRECTION",
    tasks: [task("Navigation concepts", "3 concepts explored", "MEDIUM", "IN_PROGRESS", 100, 60, 14, 10)],
    nextWeek: ["Lifecycle email templates"],
    blockers: [{ text: "Conflicting feedback from stakeholders", key: true }],
    achievements: [],
    hours: hours(2, 1, 7, 4, 8),
    notes: "",
    reviewMessage: "Add the stakeholder decisions and split the concepts into separate tasks.",
  },
  {
    authorId: "u_kavindu",
    projectId: "p_marketing",
    weeksAgo: 3,
    status: "APPROVED",
    tasks: [task("Event tracking cleanup", "Duplicate events removed", "MEDIUM", "COMPLETED", 100, 100, 14, 14)],
    nextWeek: ["Data quality checks"],
    blockers: [],
    achievements: [{ text: "Analytics volume down 18% with no data loss" }],
    hours: hours(13, 5, 4, 4, 2),
    notes: "",
    reviewMessage: "Approved.",
  },
];

function iso(date: Date): string {
  return formatISO(date);
}

function buildReport(seed: ReportSeed, index: number): Report {
  const week: WeekRange =
    seed.weeksAgo === 0 ? currentWeekRange() : weekRangeOf(subWeeks(new Date(), seed.weeksAgo));

  const weekStart = parseISO(week.start);
  const createdAt = iso(addDays(weekStart, 1));
  const submittedAt =
    seed.status === "DRAFT" ? undefined : iso(addDays(weekStart, seed.weeksAgo === 0 ? 4 : 5));
  const reviewedAt =
    seed.status === "APPROVED" || seed.status === "NEEDS_CORRECTION"
      ? iso(addDays(weekStart, 6))
      : undefined;

  const reportId = `r_${index + 1}`;

  const completedTasks: ReportTask[] = seed.tasks.map((t, i) => ({
    id: `${reportId}_t${i + 1}`,
    title: t.title,
    priority: t.priority,
    plannedPercent: t.plannedPercent,
    actualPercent: t.actualPercent,
    status: t.status,
    plannedHours: t.plannedHours,
    spentHours: t.spentHours,
    output: t.output,
  }));

  const nextWeekTasks: PlannedTask[] = seed.nextWeek.map((title, i) => ({
    id: `${reportId}_n${i + 1}`,
    title,
    priority: i === 0 ? "HIGH" : "MEDIUM",
    plannedHours: i === 0 ? 12 : 8,
  }));

  const blockers: Blocker[] = seed.blockers.map((b, i) => ({
    id: `${reportId}_b${i + 1}`,
    description: b.text,
    isKeyIssue: Boolean(b.key),
  }));

  const achievements: Achievement[] = seed.achievements.map((a, i) => ({
    id: `${reportId}_a${i + 1}`,
    description: a.text,
    isKeyAchievement: Boolean(a.key),
  }));

  const reviewComments: ReviewComment[] = seed.reviewMessage
    ? [
        {
          id: `${reportId}_c1`,
          reportId,
          versionNumber: 1,
          authorId: "u_manager",
          message: seed.reviewMessage,
          decision: seed.status === "APPROVED" ? "APPROVED" : "CHANGES_REQUESTED",
          createdAt: reviewedAt ?? createdAt,
        },
      ]
    : [];

  const versions = submittedAt
    ? [
        {
          versionNumber: 1,
          submittedAt,
          status: seed.status,
          reviewCommentId: reviewComments[0]?.id,
        },
      ]
    : [];

  return {
    id: reportId,
    authorId: seed.authorId,
    projectId: seed.projectId,
    week,
    status: seed.status,
    completedTasks,
    nextWeekTasks,
    blockers,
    achievements,
    hours: seed.hours,
    notes: seed.notes,
    links: [],
    versions,
    reviewComments,
    currentVersion: Math.max(1, versions.length),
    createdAt,
    updatedAt: reviewedAt ?? submittedAt ?? createdAt,
    submittedAt,
    reviewedAt,
    reviewedById: reviewedAt ? "u_manager" : undefined,
  };
}

export function createMockReports(): Report[] {
  return seeds.map(buildReport);
}
