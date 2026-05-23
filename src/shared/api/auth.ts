import { apiFetch } from "./client";
import type { LoginResponse } from "./types";

export function loginRequest(username: string, password: string) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
