import type { AuthService } from "./service-interfaces";
import type { AuthSession, Credentials, RegisterInput, User } from "@/types";
import { DEMO_PASSWORD } from "@/data/mock-users";
import { STORAGE_KEY_SESSION } from "@/lib/constants";
import { createId } from "@/lib/id";
import { MockServiceError, clone, delay, getDb, writeDb } from "./mock-db";

/**
 * FRONTEND MOCK AUTHENTICATION — no real credentials are verified.
 * Replace with a JWT-based implementation once the Spring Boot API exists.
 */
function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SESSION);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function storeSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY_SESSION);
}

function sessionFor(user: User): AuthSession {
  return {
    user: clone(user),
    token: `mock-token-${user.id}`,
    issuedAt: new Date().toISOString(),
  };
}

export const mockAuthService: AuthService = {
  async login({ email, password }: Credentials) {
    const user = getDb().users.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!user || password !== DEMO_PASSWORD) {
      await delay(null, 400);
      throw new MockServiceError("Incorrect email or password.", "INVALID_CREDENTIALS");
    }
    if (user.status === "DEACTIVATED") {
      throw new MockServiceError("This account has been deactivated.", "FORBIDDEN");
    }
    const session = sessionFor(user);
    storeSession(session);
    return delay(session);
  },

  async register(input: RegisterInput) {
    const exists = getDb().users.some(
      (user) => user.email.toLowerCase() === input.email.trim().toLowerCase(),
    );
    if (exists) {
      throw new MockServiceError("An account with this email already exists.", "CONFLICT");
    }
    const user: User = {
      id: createId("u"),
      fullName: input.fullName,
      email: input.email.trim().toLowerCase(),
      role: input.role,
      status: "ACTIVE",
      jobTitle: "Team Member",
      projectIds: [],
      managerId: "u_manager",
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    writeDb((db) => {
      db.users.push(user);
    });
    const session = sessionFor(user);
    storeSession(session);
    return delay(session);
  },

  async logout() {
    storeSession(null);
    await delay(null, 120);
  },

  async getSession() {
    const stored = readStoredSession();
    if (!stored) return null;
    // Re-hydrate from the store so role/profile edits are reflected.
    const fresh = getDb().users.find((user) => user.id === stored.user.id);
    if (!fresh) {
      storeSession(null);
      return null;
    }
    return { ...stored, user: clone(fresh) };
  },
};
