import { z } from "zod";
import { PRIORITIES, TASK_STATUSES } from "./constants";
import type { Priority, TaskStatus } from "@/types";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["TEAM_MEMBER", "MANAGER", "ADMIN"]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

const percent = z
  .number({ error: "Enter a number" })
  .min(0, "Must be 0 or more")
  .max(100, "Must be 100 or less");

const hours = z
  .number({ error: "Enter a number" })
  .min(0, "Hours cannot be negative")
  .max(80, "That looks too high for one week");

const priorityEnum = z.enum(PRIORITIES as [Priority, ...Priority[]]);
const taskStatusEnum = z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]);

export const reportTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Task name is required"),
  priority: priorityEnum,
  plannedPercent: percent,
  actualPercent: percent,
  status: taskStatusEnum,
  plannedHours: hours,
  spentHours: hours,
  output: z.string().max(240, "Keep the deliverable under 240 characters"),
});

export const plannedTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Task name is required"),
  priority: priorityEnum,
  plannedHours: hours,
});

export const blockerSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Describe the blocker"),
  isKeyIssue: z.boolean(),
});

export const achievementSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Describe the achievement"),
  isKeyAchievement: z.boolean(),
});

export const hoursBreakdownSchema = z.object({
  DEVELOPMENT: hours,
  TESTING: hours,
  MEETINGS: hours,
  DOCUMENTATION: hours,
  OTHER: hours,
});

export const reportLinkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Link label is required"),
  url: z.string().url("Enter a valid URL"),
});

export const reportFormSchema = z
  .object({
    projectId: z.string().min(1, "Select a project"),
    weekStart: z.string().min(1, "Select the report week"),
    weekEnd: z.string().min(1, "Select the report week"),
    completedTasks: z.array(reportTaskSchema).min(1, "Add at least one completed task"),
    nextWeekTasks: z.array(plannedTaskSchema),
    blockers: z.array(blockerSchema),
    achievements: z.array(achievementSchema),
    hours: hoursBreakdownSchema,
    notes: z.string().max(2000, "Notes are too long"),
    links: z.array(reportLinkSchema),
  })
  .refine((values) => values.weekStart <= values.weekEnd, {
    path: ["weekEnd"],
    message: "Week end must be after week start",
  })
  .refine((values) => values.blockers.filter((b) => b.isKeyIssue).length <= 1, {
    path: ["blockers"],
    message: "Only one blocker can be marked as the key issue",
  })
  .refine((values) => values.achievements.filter((a) => a.isKeyAchievement).length <= 1, {
    path: ["achievements"],
    message: "Only one achievement can be marked as the key achievement",
  });
export type ReportFormValues = z.infer<typeof reportFormSchema>;

export const requestCorrectionSchema = z.object({
  message: z
    .string()
    .min(10, "Explain what needs to change (at least 10 characters)")
    .max(1000, "Comment is too long"),
});
export type RequestCorrectionValues = z.infer<typeof requestCorrectionSchema>;

export const approveReviewSchema = z.object({
  message: z.string().max(1000, "Comment is too long").optional(),
});
export type ApproveReviewValues = z.infer<typeof approveReviewSchema>;

export const projectFormSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(5, "Add a short description").max(300, "Description is too long"),
  status: z.enum(["ACTIVE", "ON_HOLD", "ARCHIVED"]),
  memberIds: z.array(z.string()),
});
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const userFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["TEAM_MEMBER", "MANAGER", "ADMIN"]),
  jobTitle: z.string().min(2, "Job title is required"),
  projectIds: z.array(z.string()),
});
export type UserFormValues = z.infer<typeof userFormSchema>;
