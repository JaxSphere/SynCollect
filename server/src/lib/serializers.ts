import type { Account, AccountHistory, User } from "@prisma/client";

type AccountWithHistory = Account & { history: AccountHistory[] };

export function serializeAccount(account: AccountWithHistory) {
  return {
    id: account.id,
    debtorName: account.debtorName,
    debtorPhone: account.debtorPhone,
    debtorAddress: account.debtorAddress,
    balance: Number(account.balance),
    lastPayment: account.lastPayment?.toISOString().slice(0, 10) ?? null,
    status: account.status,
    assignedOfficerId: account.assignedOfficerId,
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
