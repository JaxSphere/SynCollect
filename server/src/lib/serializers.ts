import type { Account, AccountHistory, User } from "@prisma/client";

type AccountWithHistory = Account & { history: AccountHistory[]; assignedOfficer?: User | null };

export function serializeAccount(account: AccountWithHistory) {
  return {
    accountNumber: account.accountNumber,
    id: account.id,
    debtorName: account.debtorName,
    debtorPhone: account.debtorPhone,
    debtorAddress: account.debtorAddress,
    yearAccount: account.yearAccount,
    guarantorName: account.guarantorName,
    relationship: account.relationship,
    guarantorContacts: account.guarantorContacts,
    guarantorAddress: account.guarantorAddress,
    dueDate: account.dueDate?.toISOString().slice(0, 10) ?? null,
    bill: account.bill != null ? Number(account.bill) : null,
    balance: Number(account.balance),
    lastPayment: account.lastPayment?.toISOString().slice(0, 10) ?? null,
    remarks: account.remarks,
    status: account.status,
    assignedOfficerId: account.assignedOfficerId,
    assignedOfficerName: account.assignedOfficer ? account.assignedOfficer.fullName ?? account.assignedOfficer.username : null,
    history: account.history
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((entry) => ({
        date: entry.createdAt.toISOString().slice(0, 10),
        action: entry.action,
        amount: entry.amount != null ? Number(entry.amount) : undefined,
        notes: entry.notes ?? undefined,
      })),
  };
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  };
}
