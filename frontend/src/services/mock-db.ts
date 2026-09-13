import type { ActivityItem, Project, Report, User } from "@/types";
import { createMockReports } from "@/data/mock-reports";
import { createMockActivity } from "@/data/mock-activity";
import { MOCK_LATENCY_MS, STORAGE_KEY_DB } from "@/lib/constants";

/**
 * FRONTEND MOCK PERSISTENCE.
 * A tiny in-memory store mirrored to localStorage so the demo survives page
 * reloads. Every service reads and writes through here; swapping in a real
 * REST client means deleting this file, nothing else.
 */
export interface MockDatabase {
  users: User[];
  projects: Project[];
  reports: Report[];
  activity: ActivityItem[];
}

function seed(): MockDatabase {
  const reports = createMockReports();
  return {
    users: [],
    projects: [],
    reports,
    activity: createMockActivity(reports, []),
  };
}

let db: MockDatabase | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function load(): MockDatabase {
  if (db) return db;
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_DB);
      if (raw) {
        db = JSON.parse(raw) as MockDatabase;
        return db;
      }
    } catch {
      // Corrupted demo state — fall through to a fresh seed.
    }
  }
  db = seed();
  persist();
  return db;
}

function persist(): void {
  if (!db || !isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
  } catch {
    // Storage unavailable (private mode): the in-memory copy still works.
  }
}

export function getDb(): MockDatabase {
  return load();
}

/** Mutate the store and mirror it to localStorage. */
export function writeDb(mutate: (database: MockDatabase) => void): MockDatabase {
  const database = load();
  mutate(database);
  persist();
  return database;
}

export function resetDb(): MockDatabase {
  db = seed();
  persist();
  return db;
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Simulates network latency so loading states are exercised in the demo. */
export function delay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));
}

export class MockServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "INVALID_CREDENTIALS" | "CONFLICT" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "MockServiceError";
  }
}
