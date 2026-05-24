import type { UserRole } from "../../auth/types";

export type ApiUser = {
  id: string;
  username: string;
  role: UserRole;
  fullName: string | null;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  role: UserRole;
  fullName?: string | null;
};

export type UpdateUserRequest = {
  username?: string;
  password?: string;
  role?: UserRole;
  fullName?: string | null;
};

export type ApiHistoryEntry = {
  date: string;
  action: string;
  amount?: number;
  notes?: string;
};

export type ApiAccount = {
  id: string;
  accountNumber: number;
  debtorName: string;
  debtorPhone: string | null;
  debtorAddress: string | null;
  balance: number;
  lastPayment: string | null;
  status: string;
  assignedOfficerId: string | null;
  assignedOfficerName?: string | null;
  history: ApiHistoryEntry[];
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};
