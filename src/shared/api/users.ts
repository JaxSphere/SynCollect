import { apiFetch } from "./client";
import type { ApiUser, CreateUserRequest, UpdateUserRequest } from "./types";

export function fetchUsers() {
  return apiFetch<ApiUser[]>("/api/users");
}

export function createUser(payload: CreateUserRequest) {
  return apiFetch<ApiUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UpdateUserRequest) {
  return apiFetch<ApiUser>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/api/users/${id}`, {
    method: "DELETE",
  });
}
