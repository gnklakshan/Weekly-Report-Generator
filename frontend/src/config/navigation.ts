import {
  FolderKanban,
  LayoutDashboard,
  ClipboardList,
  FilePlus2,
  Users,
  UserCog,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Item is shown when the user holds at least one of these permissions. */
  permissions: Permission[];
  description?: string;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissions: ["VIEW_DASHBOARD", "VIEW_OWN_REPORTS"],
        description: "Team reporting overview",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: ClipboardList,
        permissions: ["VIEW_OWN_REPORTS", "VIEW_TEAM_REPORTS"],
        description: "Weekly report history",
      },
      {
        label: "Create report",
        href: "/reports/new",
        icon: FilePlus2,
        permissions: ["CREATE_REPORT"],
        description: "Start this week's report",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Reviews",
        href: "/reviews",
        icon: ClipboardCheck,
        permissions: ["REVIEW_REPORT"],
        description: "Reports awaiting your review",
      },
      {
        label: "Team",
        href: "/team",
        icon: Users,
        permissions: ["VIEW_TEAM_MEMBERS"],
        description: "Member status and statistics",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
        permissions: ["MANAGE_PROJECTS"],
        description: "Projects and categories",
      },
      {
        label: "Users",
        href: "/users",
        icon: UserCog,
        permissions: ["MANAGE_USERS"],
        description: "Accounts and roles",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permissions: ["VIEW_OWN_REPORTS", "VIEW_DASHBOARD"],
        description: "Profile and preferences",
      },
    ],
  },
];
