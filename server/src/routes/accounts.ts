import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serializeAccount } from "../lib/serializers.js";
import { UserRole } from "@prisma/client";

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

accountsRouter.get("/", async (req, res) => {
  const user = req.user!;

  const accounts = await prisma.account.findMany({
    where:
      user.role === UserRole.fieldOfficer
        ? { assignedOfficerId: user.userId }
        : undefined,
    include: { history: true },
    orderBy: { debtorName: "asc" },
  });

  return res.json(accounts.map(serializeAccount));
});

accountsRouter.get("/:id", async (req, res) => {
  const user = req.user!;
  const account = await prisma.account.findUnique({
    where: { id: req.params.id },
    include: { history: true },
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
  const { id, debtorName, debtorPhone, debtorAddress, balance, assignedOfficerId } = req.body as {
    id?: string;
    debtorName?: string;
    debtorPhone?: string;
    debtorAddress?: string;
    balance?: number;
    assignedOfficerId?: string;
  };

  if (!id?.trim() || !debtorName?.trim()) {
    return res.status(400).json({ error: "Account ID and debtor name are required." });
  }

  const existing = await prisma.account.findUnique({ where: { id: id.trim() } });
  if (existing) {
    return res.status(409).json({ error: "Account ID already exists." });
  }

  const account = await prisma.account.create({
    data: {
      id: id.trim(),
      debtorName: debtorName.trim(),
      debtorPhone: debtorPhone?.trim() || null,
      debtorAddress: debtorAddress?.trim() || null,
      balance: balance ?? 0,
      assignedOfficerId: assignedOfficerId || null,
    },
    include: { history: true },
  });

  return res.status(201).json(serializeAccount(account));
});

accountsRouter.put("/:id", requireRole(UserRole.manager, UserRole.admin), async (req, res) => {
  const { debtorName, debtorPhone, debtorAddress, balance, assignedOfficerId } = req.body as {
    debtorName?: string;
    debtorPhone?: string;
    debtorAddress?: string;
    balance?: number;
    assignedOfficerId?: string;
  };

  const data: {
    debtorName?: string;
    debtorPhone?: string | null;
    debtorAddress?: string | null;
    balance?: number;
    assignedOfficerId?: string | null;
  } = {};

  if (debtorName?.trim()) data.debtorName = debtorName.trim();
  if (debtorPhone !== undefined) data.debtorPhone = debtorPhone?.trim() || null;
  if (debtorAddress !== undefined) data.debtorAddress = debtorAddress?.trim() || null;
  if (balance !== undefined) data.balance = balance;
  if (assignedOfficerId !== undefined) data.assignedOfficerId = assignedOfficerId || null;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  try {
    const account = await prisma.account.update({
      where: { id: req.params.id },
      data,
      include: { history: true },
    });
    return res.json(serializeAccount(account));
  } catch {
    return res.status(404).json({ error: "Account not found." });
  }
});

accountsRouter.delete("/:id", requireRole(UserRole.manager, UserRole.admin), async (req, res) => {
  try {
    await prisma.account.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: "Account not found." });
  }
});
