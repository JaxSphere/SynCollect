import { Router } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeAccount } from "../lib/serializers.js";

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
