import type { Report } from "./report";

export interface ApproveReviewInput {
  reportId: string;
  reviewerId: string;
  message?: string;
}

export interface RequestCorrectionInput {
  reportId: string;
  reviewerId: string;
  /** Required by validation when requesting changes. */
  message: string;
}

export interface ReviewQueueItem {
  report: Report;
  authorName: string;
  projectName: string;
  waitingSinceHours: number;
}
