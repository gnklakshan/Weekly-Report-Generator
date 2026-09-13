import type { UsersService } from "./service-interfaces";
import type { CreateUserInput, UpdateUserInput, User, UserFilters } from "@/types";
import { createId } from "@/lib/id";
import { MockServiceError, delay, getDb, writeDb } from "./mock-db";

function matches(user: User, filters?: UserFilters): boolean {
  if (!filters) return true;
  const search = filters.search?.trim().toLowerCase();
  if (search && !`${user.fullName} ${user.email}`.toLowerCase().includes(search)) return false;
  if (filters.role && filters.role !== "ALL" && user.role !== filters.role) return false;
  if (filters.status && filters.status !== "ALL" && user.status !== filters.status) return false;
  return true;
}

export const mockUsersService: UsersService = {
  async getUsers(filters) {
    return delay(getDb().users.filter((user) => matches(user, filters)));
  },

  async getUser(id) {
    return delay(getDb().users.find((user) => user.id === id) ?? null);
  },

  async createUser(data: CreateUserInput) {
    const exists = getDb().users.some(
      (user) => user.email.toLowerCase() === data.email.trim().toLowerCase(),
    );
    if (exists) throw new MockServiceError("That email is already in use.", "CONFLICT");

    const user: User = {
      id: createId("u"),
      fullName: data.fullName,
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: "INVITED",
      jobTitle: data.jobTitle,
      projectIds: data.projectIds,
      ...(data.role === "TEAM_MEMBER" ? { managerId: "u_manager" } : {}),
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    writeDb((db) => {
      db.users.push(user);
    });
    return delay(user);
  },

  async updateUser(id, data: UpdateUserInput) {
    let updated: User | undefined;
    writeDb((db) => {
      const existing = db.users.find((user) => user.id === id);
      if (!existing) return;
      Object.assign(existing, data);
      updated = existing;
    });
    if (!updated) throw new MockServiceError("User not found.", "NOT_FOUND");
    return delay(updated);
  },

  async deleteUser(id) {
    writeDb((db) => {
      db.users = db.users.filter((user) => user.id !== id);
      db.projects = db.projects.map((project) => ({
        ...project,
        memberIds: project.memberIds.filter((memberId) => memberId !== id),
      }));
    });
    await delay(null);
  },
};
