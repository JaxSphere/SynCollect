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

export type ApiVisit = {
  id: string;
  accountId: string;
  officerId?: string;
  officerName?: string;
  remarkType: string;
  housePhoto?: string;
  clientPhoto?: string;
  additionalPhotos?: string[];
  ptpAmount?: number;
  ptpDate?: string;
  scheduledDate?: string;
  notes?: string;
  gpsVerified: boolean;
  createdAt: string;
};

export type ApiAccount = {
  id: string;
  accountNumber: number;
  debtorName: string;
  debtorPhone: string | null;
  debtorAddress: string | null;
  yearAccount: number | null;
  guarantorName: string | null;
  relationship: string | null;
  guarantorContacts: string | null;
  guarantorAddress: string | null;
  dueDate: string | null;
  bill: number | null;
  balance: number;
  lastPayment: string | null;
  remarks: string | null;
  creditor: string | null;
  status: string;
  assignedOfficerId: string | null;
  assignedOfficerName?: string | null;
  history: ApiHistoryEntry[];
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};
