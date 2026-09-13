import type { UserRole, UserStatus } from "@/types";

/** Ordered to match ROLE_LABEL / USER_STATUS_LABEL key order. */
export const USER_ROLES: UserRole[] = ["TEAM_MEMBER", "MANAGER", "ADMIN"];
export const USER_STATUSES: UserStatus[] = ["ACTIVE", "INVITED", "DEACTIVATED"];

/** Sentinel used by the role/status filters — never sent as a real value. */
export const ALL = "ALL";

/** Why an administrator cannot disable or delete the account they are signed in with. */
export const SELF_ACTION_HINT = "You can't change the status of the account you're signed in with.";
