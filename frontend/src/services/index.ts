/**
 * Single composition point for the frontend service layer.
 * Swapping the mock implementations for REST clients happens here only.
 */
import { mockReportsService } from "./mock-reports.service";
import { mockReviewsService } from "./mock-reviews.service";
import { mockProjectsService } from "./mock-projects.service";
import { mockUsersService } from "./mock-users.service";
import { mockDashboardService } from "./mock-dashboard.service";

export const reportsService = mockReportsService;
export const reviewsService = mockReviewsService;
export const projectsService = mockProjectsService;
export const usersService = mockUsersService;
export const dashboardService = mockDashboardService;

export * from "./service-interfaces";
export { MockServiceError, resetDb } from "./mock-db";
