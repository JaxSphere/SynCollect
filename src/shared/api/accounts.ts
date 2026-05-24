import { apiFetch } from "./client";
import type { ApiAccount } from "./types";

export type CreateAccountRequest = {
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

function requireAccountId(id: string | number) {
  const accountId = String(id).trim();
  if (!accountId) {
    throw new Error("Account ID is required.");
  }
  return encodeURIComponent(accountId);
}

export function fetchAccount(id: string | number) {
  return apiFetch<ApiAccount>(`/api/accounts/${requireAccountId(id)}`);
}

export function createAccount(payload: CreateAccountRequest) {
  return apiFetch<ApiAccount>("/api/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAccount(id: string | number, payload: UpdateAccountRequest) {
  return apiFetch<ApiAccount>(`/api/accounts/${requireAccountId(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAccount(id: string | number) {
  return apiFetch<void>(`/api/accounts/${requireAccountId(id)}`, {
    method: "DELETE",
  });
}
