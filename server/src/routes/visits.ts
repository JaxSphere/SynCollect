import { Router } from "express";
import { AccountStatus, UserRole, VisitRemarkType } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const visitsRouter = Router();

visitsRouter.use(requireAuth, requireRole(UserRole.fieldOfficer));

function mapRemarkToStatus(remarkType: VisitRemarkType): AccountStatus {
  switch (remarkType) {
    case VisitRemarkType.willing:
      return AccountStatus.ptp;
    case VisitRemarkType.unlocated:
      return AccountStatus.unlocated;
    case VisitRemarkType.refused:
      return AccountStatus.refused;
    case VisitRemarkType.moved_out:
      return AccountStatus.visited;
    default:
      return AccountStatus.visited;
  }
}

visitsRouter.post("/", async (req, res) => {
  const user = req.user!;
  const {
    accountId,
    remarkType,
    ptpAmount,
    ptpDate,
    notes,
    gpsVerified,
  } = req.body as {
    accountId?: string;
    remarkType?: VisitRemarkType;
    ptpAmount?: number;
    ptpDate?: string;
    notes?: string;
    gpsVerified?: boolean;
  };

  const resolvedAccountId = accountId?.trim();
  if (!resolvedAccountId || !remarkType) {
    return res.status(400).json({ error: "accountId and remarkType are required." });
  }

  if (!Object.values(VisitRemarkType).includes(remarkType)) {
    return res.status(400).json({ error: "Invalid remarkType." });
  }

  const account = /^[0-9]+$/.test(resolvedAccountId)
    ? await prisma.account.findUnique({ where: { accountNumber: Number(resolvedAccountId) } })
    : await prisma.account.findUnique({ where: { id: resolvedAccountId } });

  if (!account) {
    return res.status(404).json({ error: "Account not found." });
  }

  if (account.assignedOfficerId !== user.userId) {
    return res.status(403).json({ error: "Account not assigned to you." });
  }

  const visit = await prisma.$transaction(async (tx) => {
    const created = await tx.visit.create({
      data: {
        accountId: account.id,
        officerId: user.userId,
        remarkType,
        ptpAmount: ptpAmount ?? undefined,
        ptpDate: ptpDate ? new Date(ptpDate) : undefined,
        notes,
        gpsVerified: gpsVerified ?? false,
      },
    });

    const nextStatus = mapRemarkToStatus(remarkType);
    await tx.account.update({
      where: { id: account.id },
      data: { status: nextStatus },
    });

    const actionLabel =
      remarkType === VisitRemarkType.willing
        ? "Visit - PTP"
        : `Visit - ${remarkType.replace("_", " ")}`;

    await tx.accountHistory.create({
      data: {
        accountId: account.id,
        action: actionLabel,
        amount: ptpAmount ?? undefined,
        notes,
        createdBy: user.userId,
      },
    });

    return created;
  });

  return res.status(201).json({
      id: visit.id,
      accountId: visit.accountId,
      remarkType: visit.remarkType,
      ptpAmount: visit.ptpAmount ?? undefined,
      ptpDate: visit.ptpDate?.toISOString().slice(0, 10),
      notes: visit.notes ?? undefined,
      gpsVerified: visit.gpsVerified,
      createdAt: visit.createdAt.toISOString(),
    });
});
