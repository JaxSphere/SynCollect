import { apiFetch } from "./client";
import type { ApiAccount } from "./types";

export type CreateAccountRequest = {
  id: string;
  debtorName: string;
  debtorPhone?: string;
  debtorAddress?: string;
  balance?: number;
  assignedOfficerId?: string;
};

export type UpdateAccountRequest = {
  debtorName?: string;
  debtorPhone?: string;
  debtorAddress?: string;
  balance?: number;
  assignedOfficerId?: string;
};

export function fetchAccounts() {
  return apiFetch<ApiAccount[]>("/api/accounts");
}

export function fetchAccount(id: string) {
  return apiFetch<ApiAccount>(`/api/accounts/${id}`);
}

export function createAccount(payload: CreateAccountRequest) {
  return apiFetch<ApiAccount>("/api/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAccount(id: string, payload: UpdateAccountRequest) {
  return apiFetch<ApiAccount>(`/api/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAccount(id: string) {
  return apiFetch<void>(`/api/accounts/${id}`, {
    method: "DELETE",
  });
}
