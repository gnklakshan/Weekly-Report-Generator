import { useCallback } from "react";
import { STORAGE_KEY_SESSION } from "@/lib/constants";
import type { AuthSession } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useApi() {
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) {
        const session = JSON.parse(raw) as AuthSession;
        return session.token;
      }
    } catch {
      // Ignore parse error
    }
    return null;
  }, []);

  const request = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const token = getToken();
      
      // Ensure we merge headers correctly
      const headers = new Headers(options.headers);
      
      // Default to JSON if not explicitly set and body is not FormData
      if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Ensure endpoint starts with slash if not included
      const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

      const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = "An error occurred during the API request.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response isn't JSON, leave default message
        }
        throw new Error(errorMessage);
      }
      
      // 204 No Content means successful but empty body
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return response.json();
    },
    [getToken]
  );

  return { request };
}
