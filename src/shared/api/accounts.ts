import { apiFetch } from "./client";
import type { ApiAccount } from "./types";

export type CreateAccountRequest = {
  debtorName: string;
  accountNumber: number;
  debtorPhone?: string;
  debtorAddress?: string;
  yearAccount?: number;
  guarantorName?: string;
  relationship?: string;
  guarantorContacts?: string;
  guarantorAddress?: string;
  dueDate?: string;
  bill?: number;
  balance?: number;
  lastPayment?: string;
  remarks?: string;
  creditor?: string;
  assignedOfficerId?: string;
};

export type UpdateAccountRequest = {
  debtorName?: string;
  debtorPhone?: string;
  debtorAddress?: string;
  accountNumber?: number;
  yearAccount?: number | null;
  guarantorName?: string;
  relationship?: string;
  guarantorContacts?: string;
  guarantorAddress?: string;
  dueDate?: string | null;
  bill?: number | null;
  balance?: number;
  lastPayment?: string | null;
  remarks?: string;
  creditor?: string;
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
