import { differenceInHours, parseISO } from "date-fns";
import type { ReviewsService } from "./service-interfaces";
import type {
  ApproveReviewInput,
  Report,
  RequestCorrectionInput,
  ReviewComment,
  ReviewQueueItem,
} from "@/types";
import { createId } from "@/lib/id";
import { MockServiceError, delay, getDb, writeDb } from "./mock-db";
import { pushActivity } from "./mock-reports.service";

function appendComment(
  report: Report,
  reviewerId: string,
  message: string,
  decision: ReviewComment["decision"],
  createdAt: string,
): ReviewComment {
  const comment: ReviewComment = {
    id: createId("c"),
    reportId: report.id,
    versionNumber: report.currentVersion,
    authorId: reviewerId,
    message,
    decision,
    createdAt,
  };
  report.reviewComments.push(comment);
  const version = report.versions.find((v) => v.versionNumber === report.currentVersion);
  if (version) {
    version.reviewCommentId = comment.id;
    version.status = report.status;
  }
  return comment;
}

export const mockReviewsService: ReviewsService = {
  async getReviewQueue() {
    const db = getDb();
    const items: ReviewQueueItem[] = db.reports
      .filter((report) => report.status === "SUBMITTED")
      .map((report) => ({
        report,
        authorName: db.users.find((user) => user.id === report.authorId)?.fullName ?? "Unknown",
        projectName:
          db.projects.find((project) => project.id === report.projectId)?.name ?? "Unassigned",
        waitingSinceHours: report.submittedAt
          ? Math.max(0, differenceInHours(new Date(), parseISO(report.submittedAt)))
          : 0,
      }))
      .sort((a, b) => b.waitingSinceHours - a.waitingSinceHours);
    return delay(items);
  },

  async approveReport({ reportId, reviewerId, message }: ApproveReviewInput) {
    let updated: Report | undefined;
    const now = new Date().toISOString();
    writeDb((db) => {
      const report = db.reports.find((candidate) => candidate.id === reportId);
      if (!report) return;
      if (report.status !== "SUBMITTED") {
        throw new MockServiceError("Only submitted reports can be reviewed.", "FORBIDDEN");
      }
      report.status = "APPROVED";
      report.reviewedAt = now;
      report.reviewedById = reviewerId;
      report.updatedAt = now;
      appendComment(report, reviewerId, message?.trim() || "Approved.", "APPROVED", now);
      pushActivity(db, {
        kind: "REPORT_APPROVED",
        actorId: report.authorId,
        reportId: report.id,
        message: "had their weekly report approved",
        createdAt: now,
      });
      updated = report;
    });
    if (!updated) throw new MockServiceError("Report not found.", "NOT_FOUND");
    return delay(updated);
  },

  async requestCorrection({ reportId, reviewerId, message }: RequestCorrectionInput) {
    if (!message.trim()) {
      throw new MockServiceError("A correction comment is required.", "FORBIDDEN");
    }
    let updated: Report | undefined;
    const now = new Date().toISOString();
    writeDb((db) => {
      const report = db.reports.find((candidate) => candidate.id === reportId);
      if (!report) return;
      if (report.status !== "SUBMITTED") {
        throw new MockServiceError("Only submitted reports can be reviewed.", "FORBIDDEN");
      }
      report.status = "NEEDS_CORRECTION";
      report.reviewedAt = now;
      report.reviewedById = reviewerId;
      report.updatedAt = now;
      appendComment(report, reviewerId, message.trim(), "CHANGES_REQUESTED", now);
      pushActivity(db, {
        kind: "CORRECTION_REQUESTED",
        actorId: report.authorId,
        reportId: report.id,
        message: "had their report sent back for correction",
        createdAt: now,
      });
      updated = report;
    });
    if (!updated) throw new MockServiceError("Report not found.", "NOT_FOUND");
    return delay(updated);
  },
};
