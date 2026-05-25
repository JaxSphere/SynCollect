import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serializeAccount } from "../lib/serializers.js";
import { logAudit } from "../lib/auditLogger.js";
import { UserRole } from "@prisma/client";

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

function optionalText(value: string | undefined) {
  return value?.trim() || null;
}

function optionalDate(value: string | undefined | null) {
  return value ? new Date(value) : null;
}

accountsRouter.get("/", async (req, res) => {
  const user = req.user!;

  const accounts = await prisma.account.findMany({
    where:
      user.role === UserRole.fieldOfficer
        ? { assignedOfficerId: user.userId }
        : undefined,
    include: { history: true, assignedOfficer: true },
    orderBy: { debtorName: "asc" },
  });

  return res.json(accounts.map(serializeAccount));
});

accountsRouter.get("/:id", async (req, res) => {
  const user = req.user!;
  const rawAccountId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!rawAccountId?.trim()) {
    return res.status(400).json({ error: "Account ID is required." });
  }

  const where = /^[0-9]+$/.test(rawAccountId) ? { accountNumber: Number(rawAccountId) } : { id: rawAccountId };

  const account = await prisma.account.findUnique({
    where: where as any,
    include: { history: true, assignedOfficer: true },
  });

  if (!account) {
    return res.status(404).json({ error: "Account not found." });
  }

  if (
    user.role === UserRole.fieldOfficer &&
    account.assignedOfficerId !== user.userId
  ) {
    return res.status(403).json({ error: "Account not assigned to you." });
  }

  return res.json(serializeAccount(account));
});

accountsRouter.post("/", requireRole(UserRole.manager, UserRole.admin), async (req, res) => {
  const {
    debtorName,
    debtorPhone,
    debtorAddress,
    accountNumber,
    yearAccount,
    guarantorName,
    relationship,
    guarantorContacts,
    guarantorAddress,
    dueDate,
    bill,
    balance,
    lastPayment,
    remarks,
    creditor,
    assignedOfficerId,
  } = req.body as {
    debtorName?: string;
    debtorPhone?: string;
    debtorAddress?: string;
    accountNumber?: number;
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

  if (!debtorName?.trim()) {
    return res.status(400).json({ error: "Debtor name is required." });
  }

  if (accountNumber === undefined || accountNumber === null) {
    return res.status(400).json({ error: "Account number is required." });
  }

  if (!Number.isInteger(accountNumber) || accountNumber <= 0) {
    return res.status(400).json({ error: "accountNumber must be a positive integer." });
  }

  const existing = await prisma.account.findUnique({ where: { accountNumber } as any });
  if (existing) {
    return res.status(400).json({ error: "Account number already exists." });
  }

  const account = await prisma.account.create({
    data: {
      debtorName: debtorName.trim(),
      debtorPhone: optionalText(debtorPhone),
      debtorAddress: optionalText(debtorAddress),
      accountNumber,
      yearAccount: yearAccount ?? null,
      guarantorName: optionalText(guarantorName),
      relationship: optionalText(relationship),
      guarantorContacts: optionalText(guarantorContacts),
      guarantorAddress: optionalText(guarantorAddress),
      dueDate: optionalDate(dueDate),
      bill: bill ?? null,
      balance: balance ?? 0,
      lastPayment: optionalDate(lastPayment),
      remarks: optionalText(remarks),
      creditor: optionalText(creditor),
      assignedOfficerId: assignedOfficerId || null,
    } as any,
    include: { history: true, assignedOfficer: true },
  });

  await logAudit({
    action: "ACCOUNT_CREATED",
    targetType: "ACCOUNT",
    targetId: account.id,
    targetName: `${debtorName.trim()} (#${accountNumber})`,
    performedById: req.user!.userId,
    performedBy: req.user!.username,
  });

  return res.status(201).json(serializeAccount(account));
});

accountsRouter.put("/:id", requireRole(UserRole.manager, UserRole.admin), async (req, res) => {
  const {
    debtorName,
    debtorPhone,
    debtorAddress,
    yearAccount,
    guarantorName,
    relationship,
    guarantorContacts,
    guarantorAddress,
    dueDate,
    bill,
    balance,
    lastPayment,
    remarks,
    creditor,
    assignedOfficerId,
    accountNumber,
  } = req.body as {
    debtorName?: string;
    debtorPhone?: string;
    debtorAddress?: string;
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
    accountNumber?: number;
  };

  const rawAccountId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rawAccountId?.trim()) {
    return res.status(400).json({ error: "Account ID is required." });
  }

  const where = /^[0-9]+$/.test(rawAccountId) ? { accountNumber: Number(rawAccountId) } : { id: rawAccountId };

  const targetAccount = await prisma.account.findUnique({ where: where as any, select: { id: true } });
  if (!targetAccount) {
    return res.status(404).json({ error: "Account not found." });
  }

  if (accountNumber !== undefined) {
    if (!Number.isInteger(accountNumber) || accountNumber <= 0) {
      return res.status(400).json({ error: "accountNumber must be a positive integer." });
    }
    const existingAccount = await prisma.account.findFirst({ where: { accountNumber } as any });
    if (existingAccount && existingAccount.id !== targetAccount.id) {
      return res.status(400).json({ error: "Account number already exists." });
    }
  }

  const data: {
    debtorName?: string;
    debtorPhone?: string | null;
    debtorAddress?: string | null;
    yearAccount?: number | null;
    guarantorName?: string | null;
    relationship?: string | null;
    guarantorContacts?: string | null;
    guarantorAddress?: string | null;
    dueDate?: Date | null;
    bill?: number | null;
    balance?: number;
    lastPayment?: Date | null;
    remarks?: string | null;
    creditor?: string | null;
    assignedOfficerId?: string | null;
    accountNumber?: number;
  } = {};

  if (debtorName?.trim()) data.debtorName = debtorName.trim();
  if (debtorPhone !== undefined) data.debtorPhone = optionalText(debtorPhone);
  if (debtorAddress !== undefined) data.debtorAddress = optionalText(debtorAddress);
  if (yearAccount !== undefined) data.yearAccount = yearAccount;
  if (guarantorName !== undefined) data.guarantorName = optionalText(guarantorName);
  if (relationship !== undefined) data.relationship = relationship;
  if (guarantorContacts !== undefined) data.guarantorContacts = optionalText(guarantorContacts);
  if (guarantorAddress !== undefined) data.guarantorAddress = optionalText(guarantorAddress);
  if (dueDate !== undefined) data.dueDate = optionalDate(dueDate);
  if (bill !== undefined) data.bill = bill;
  if (balance !== undefined) data.balance = balance;
  if (lastPayment !== undefined) data.lastPayment = optionalDate(lastPayment);
  if (remarks !== undefined) data.remarks = optionalText(remarks);
  if (creditor !== undefined) data.creditor = optionalText(creditor);
  if (assignedOfficerId !== undefined) data.assignedOfficerId = assignedOfficerId || null;
  if (accountNumber !== undefined) data.accountNumber = accountNumber;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  try {
    const account = await prisma.account.update({
      where: where as any,
      data: data as any,
      include: { history: true, assignedOfficer: true },
    });

    await logAudit({
      action: "ACCOUNT_UPDATED",
      targetType: "ACCOUNT",
      targetId: account.id,
      targetName: `${account.debtorName} (#${account.accountNumber})`,
      performedById: req.user!.userId,
      performedBy: req.user!.username,
      details: { updatedFields: Object.keys(data) },
    });

    return res.json(serializeAccount(account));
  } catch {
    return res.status(404).json({ error: "Account not found." });
  }
});

accountsRouter.delete("/:id", requireRole(UserRole.manager, UserRole.admin), async (req, res) => {
  const rawAccountId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rawAccountId?.trim()) {
    return res.status(400).json({ error: "Account ID is required." });
  }

  const where = /^[0-9]+$/.test(rawAccountId) ? { accountNumber: Number(rawAccountId) } : { id: rawAccountId };

  try {
    const account = await prisma.account.findUnique({ where: where as any, select: { id: true, debtorName: true, accountNumber: true } });
    await prisma.account.delete({ where: where as any });

    if (account) {
      await logAudit({
        action: "ACCOUNT_DELETED",
        targetType: "ACCOUNT",
        targetId: account.id,
        targetName: `${account.debtorName} (#${account.accountNumber})`,
        performedById: req.user!.userId,
        performedBy: req.user!.username,
      });
    }

    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: "Account not found." });
  }
});
