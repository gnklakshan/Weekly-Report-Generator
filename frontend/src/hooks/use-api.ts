import { useCallback, useRef } from "react";
import { STORAGE_KEY_SESSION } from "@/lib/constants";
import type { AuthSession } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Simple in-memory cache for GET requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30000; // 30 seconds

function getCacheKey(endpoint: string): string {
  return endpoint;
}

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCacheData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(): void {
  cache.clear();
}

export function useApi() {
  const abortControllers = useRef(new Map<string, AbortController>());

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
      const method = (options.method || "GET").toUpperCase();
      const isGetRequest = method === "GET";
      
      // Normalize endpoint for cache key
      const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const cacheKey = getCacheKey(normalizedEndpoint);
      
      // Check cache for GET requests
      if (isGetRequest && !options.headers) {
        const cachedData = getCachedData<T>(cacheKey);
        if (cachedData !== null) {
          return cachedData;
        }
      }
      
      // Cancel any existing request for the same endpoint
      const existingController = abortControllers.current.get(cacheKey);
      if (existingController) {
        existingController.abort();
      }
      
      // Create new abort controller
      const controller = new AbortController();
      abortControllers.current.set(cacheKey, controller);
      
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

      try {
        const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
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
          abortControllers.current.delete(cacheKey);
          return undefined as unknown as T;
        }

        const data = await response.json();
        
        // Cache successful GET responses
        if (isGetRequest) {
          setCacheData(cacheKey, data);
        }
        
        abortControllers.current.delete(cacheKey);
        return data;
      } catch (error) {
        abortControllers.current.delete(cacheKey);
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled, throw a specific error
          throw new Error("Request cancelled");
        }
        throw error;
      }
    },
    [getToken]
  );

  return { request };
}
