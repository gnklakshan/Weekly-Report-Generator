import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services";
import { hasAnyPermission as checkAny, hasPermission as checkOne } from "@/lib/permissions";
import type { Credentials, Permission, RegisterInput, User } from "@/types";

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

/**
 * FRONTEND MOCK SESSION provider. Reads/writes the mock auth service only;
 * swapping in a real API means changing `src/services/index.ts`, not this file.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;
    void authService.getSession().then((session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authService.register(input);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
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
