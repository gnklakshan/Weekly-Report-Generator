import type { Permission, User, UserRole } from "@/types";

/**
 * Central role -> permission map. Components must ask `hasPermission(...)`
 * instead of comparing `user.role` inline.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  TEAM_MEMBER: ["VIEW_OWN_REPORTS", "CREATE_REPORT", "EDIT_OWN_REPORT"],
  ADMIN: [
    "VIEW_OWN_REPORTS",
    "VIEW_TEAM_REPORTS",
    "VIEW_TEAM_MEMBERS",
    "VIEW_DASHBOARD",
    "MANAGE_PROJECTS",
    "MANAGE_USERS",
  ],
};

export function permissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function hasAnyPermission(
  user: User | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function canEditReport(
  user: User | null | undefined,
  report: { authorId: string; status: string },
): boolean {
  if (!user) return false;
  if (report.authorId !== user.id) return false;
  if (!hasPermission(user, "EDIT_OWN_REPORT")) return false;
  return report.status === "DRAFT" || report.status === "NEEDS_CORRECTION";
}

export function canReviewReport(
  user: User | null | undefined,
  report: { authorId: string; status: string },
): boolean {
  if (!hasPermission(user, "REVIEW_REPORT")) return false;
  if (user && report.authorId === user.id) return false;
  return report.status === "SUBMITTED";
}
