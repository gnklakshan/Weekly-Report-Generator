import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEY_SESSION } from "@/lib/constants";
import { hasAnyPermission as checkAny, hasPermission as checkOne } from "@/lib/permissions";
import type { AuthSession, Credentials, Permission, RegisterInput, User } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
  if (session) {
    window.localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY_SESSION);
  }
}

function getToken(): string | null {
  const session = readStoredSession();
  return session ? session.token : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    async function initSession() {
      const session = readStoredSession();
      if (!session || !session.token) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${session.token}` }
        });

        if (!response.ok) {
          storeSession(null);
          if (active) {
            setUser(null);
            setStatus("unauthenticated");
          }
          return;
        }

        const freshUser = await response.json();
        const updatedSession = { ...session, user: freshUser };
        storeSession(updatedSession);

        if (active) {
          setUser(freshUser);
          setStatus("authenticated");
        }
      } catch (e) {
        if (active) {
          setUser(session.user);
          setStatus("authenticated");
        }
      }
    }

    initSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to login. Please check your credentials.");
    }

    const session = await response.json();
    storeSession(session);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to register. Please try again.");
    }

    const session = await response.json();
    storeSession(session);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {
        // ignore network error
      }
    }
    storeSession(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated" && user !== null,
      login,
      register,
      logout,
      hasPermission: (permission) => checkOne(user, permission),
      hasAnyPermission: (permissions) => checkAny(user, permissions),
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
