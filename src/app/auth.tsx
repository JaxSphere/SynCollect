import React, { createContext, useContext, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AUTH_KEY = "dcms-authenticated";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem(AUTH_KEY) === "true",
  );

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      login: (username: string, password: string) => {
        const valid = username.trim().length > 0 && password.trim().length > 0;
        if (valid) {
          localStorage.setItem(AUTH_KEY, "true");
          setIsAuthenticated(true);
        }
        return valid;
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
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

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
