import { apiFetch } from "./client";
import type { ApiAccount } from "./types";

export function fetchAccounts() {
  return apiFetch<ApiAccount[]>("/api/accounts");
}

export function fetchAccount(id: string) {
  return apiFetch<ApiAccount>(`/api/accounts/${id}`);
}
