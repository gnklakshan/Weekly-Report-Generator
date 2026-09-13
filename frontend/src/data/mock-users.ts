import type { User } from "@/types";

/**
 * DEMO DATA — fictional identities used while the frontend runs without a backend.
 * Demo password for every account: `password123`.
 */
export const DEMO_PASSWORD = "password123";

export const mockUsers: User[] = [
  {
    id: "u_manager",
    fullName: "Priya Wickramasinghe",
    email: "manager@example.com",
    role: "MANAGER",
    status: "ACTIVE",
    jobTitle: "Engineering Manager",
    projectIds: ["p_client_portal", "p_internal_tooling", "p_mobile_app"],
    joinedAt: "2023-02-13",
  },
  {
    id: "u_admin",
    fullName: "Ruwan Gunasekara",
    email: "admin@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    jobTitle: "Workspace Administrator",
    projectIds: [],
    joinedAt: "2022-11-07",
  },
  {
    id: "u_alex",
    fullName: "Alex Perera",
    email: "member@example.com",
    role: "TEAM_MEMBER",
    status: "ACTIVE",
    jobTitle: "Senior Frontend Engineer",
    projectIds: ["p_client_portal", "p_internal_tooling"],
    managerId: "u_manager",
    joinedAt: "2023-04-03",
  },
  {
    id: "u_sarah",
    fullName: "Sarah Fernando",
    email: "sarah@example.com",
    role: "TEAM_MEMBER",
    status: "ACTIVE",
    jobTitle: "Backend Engineer",
    projectIds: ["p_client_portal", "p_rnd"],
    managerId: "u_manager",
    joinedAt: "2023-06-19",
  },
  {
    id: "u_daniel",
    fullName: "Daniel Silva",
    email: "daniel@example.com",
    role: "TEAM_MEMBER",
    status: "ACTIVE",
    jobTitle: "QA Engineer",
    projectIds: ["p_mobile_app", "p_internal_tooling"],
    managerId: "u_manager",
    joinedAt: "2024-01-08",
  },
  {
    id: "u_nethmi",
    fullName: "Nethmi Jayasinghe",
    email: "nethmi@example.com",
    role: "TEAM_MEMBER",
    status: "ACTIVE",
    jobTitle: "Product Designer",
    projectIds: ["p_mobile_app", "p_marketing"],
    managerId: "u_manager",
    joinedAt: "2024-03-25",
  },
  {
    id: "u_kavindu",
    fullName: "Kavindu Peris",
    email: "kavindu@example.com",
    role: "TEAM_MEMBER",
    status: "ACTIVE",
    jobTitle: "Data Engineer",
    projectIds: ["p_rnd", "p_marketing"],
    managerId: "u_manager",
    joinedAt: "2024-09-02",
  },
];

export const TEAM_MEMBER_IDS = mockUsers
  .filter((user) => user.role === "TEAM_MEMBER")
  .map((user) => user.id);
