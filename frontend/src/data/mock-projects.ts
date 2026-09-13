import type { Project } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "p_client_portal",
    name: "Client Portal",
    description: "Customer-facing self-service portal for invoices, tickets and reporting.",
    status: "ACTIVE",
    colorToken: "chart-1",
    memberIds: ["u_alex", "u_sarah"],
    createdAt: "2023-03-01",
  },
  {
    id: "p_internal_tooling",
    name: "Internal Tooling",
    description: "Operations tooling used by delivery and support teams.",
    status: "ACTIVE",
    colorToken: "chart-2",
    memberIds: ["u_alex", "u_daniel"],
    createdAt: "2023-05-22",
  },
  {
    id: "p_mobile_app",
    name: "Mobile Application",
    description: "iOS and Android companion app for portal customers.",
    status: "ACTIVE",
    colorToken: "chart-3",
    memberIds: ["u_daniel", "u_nethmi"],
    createdAt: "2023-10-11",
  },
  {
    id: "p_rnd",
    name: "R&D",
    description: "Exploratory work on data pipelines and platform performance.",
    status: "ACTIVE",
    colorToken: "chart-4",
    memberIds: ["u_sarah", "u_kavindu"],
    createdAt: "2024-02-05",
  },
  {
    id: "p_marketing",
    name: "Marketing Automation",
    description: "Campaign tooling, analytics events and lifecycle messaging.",
    status: "ON_HOLD",
    colorToken: "chart-5",
    memberIds: ["u_nethmi", "u_kavindu"],
    createdAt: "2024-07-18",
  },
];
