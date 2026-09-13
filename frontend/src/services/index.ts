/**
 * Service layer — all API calls are now made directly via `useApi` in hooks and components.
 * This file is kept only for the mock-db reset utility used in development.
 */
export { MockServiceError, resetDb } from "./mock-db";
