import React, { createContext, useContext, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { loginRequest } from "../shared/api/auth";
import { clearToken, getToken, setToken } from "../shared/api/client";
import { getHomePath, type UserRole } from "./types";

const ROLE_KEY = "dcms-role";

type AuthContextType = {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<UserRole>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredRole(): UserRole | null {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "admin" || stored === "manager" || stored === "fieldOfficer") {
    return stored;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());
  const [role, setRole] = useState<UserRole | null>(() =>
    getToken() ? readStoredRole() : null,
  );

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      role,
      login: async (username: string, password: string) => {
        const { token, user } = await loginRequest(username, password);
        setToken(token);
        localStorage.setItem(ROLE_KEY, user.role);
        setIsAuthenticated(true);
        setRole(user.role);
        return user.role;
      },
      logout: () => {
        clearToken();
        localStorage.removeItem(ROLE_KEY);
        setIsAuthenticated(false);
        setRole(null);
      },
    }),
    [isAuthenticated, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return ctx;
}

export function RequireAdmin() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "admin") {
    return <Navigate to={getHomePath(role ?? "manager")} replace />;
  }
  return <Outlet />;
}

export function RequireManager() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "manager") {
    return <Navigate to={getHomePath(role ?? "fieldOfficer")} replace />;
  }
  return <Outlet />;
}

export function RequireFieldOfficer() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "fieldOfficer") {
    return <Navigate to={getHomePath(role ?? "manager")} replace />;
  }
  return <Outlet />;
}
