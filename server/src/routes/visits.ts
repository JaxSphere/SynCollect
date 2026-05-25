import { Router } from "express";
import { AccountStatus, UserRole, VisitRemarkType } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const visitsRouter = Router();

visitsRouter.use(requireAuth);

const allowedVisitRemarkTypes = [
  'willing',
  'responsed',
  'unlocated',
  'transfer_residence',
  'full_paid',
  'refuse_to_receive_and_sign',
  'for_follow_up',
  'dont_have_capacity_to_pay',
  'onhold_account',
  'difficult_to_reach_out',
  'moved_out',
  'refused',
] as const;

const followUpRemarkTypes = [
  'unlocated',
  'refuse_to_receive_and_sign',
  'for_follow_up',
  'dont_have_capacity_to_pay',
  'difficult_to_reach_out',
] as const;

function remarkRequiresScheduleDate(value: string): value is typeof followUpRemarkTypes[number] {
  return typeof value === 'string' && followUpRemarkTypes.includes(value as any);
}

type AllowedVisitRemarkType = (typeof allowedVisitRemarkTypes)[number];

function isValidVisitRemarkType(value: unknown): value is AllowedVisitRemarkType {
  return typeof value === 'string' && (allowedVisitRemarkTypes as readonly string[]).includes(value);
}

function mapRemarkToStatus(remarkType: VisitRemarkType): AccountStatus {
  switch (remarkType) {
    case VisitRemarkType.willing:
    case VisitRemarkType.responsed:
      return AccountStatus.ptp;
    case VisitRemarkType.unlocated:
    case VisitRemarkType.difficult_to_reach_out:
      return AccountStatus.unlocated;
    case VisitRemarkType.refused:
    case VisitRemarkType.refuse_to_receive_and_sign:
      return AccountStatus.refused;
    case VisitRemarkType.moved_out:
    case VisitRemarkType.transfer_residence:
      return AccountStatus.visited;
    case VisitRemarkType.full_paid:
      return AccountStatus.closed;
    case VisitRemarkType.for_follow_up:
    case VisitRemarkType.dont_have_capacity_to_pay:
    case VisitRemarkType.onhold_account:
      return AccountStatus.pending;
    default:
      return AccountStatus.visited;
  }
}

visitsRouter.get("/", async (req, res) => {
  const user = req.user!;
  const queryAccountId = Array.isArray(req.query.accountId) ? req.query.accountId[0] : req.query.accountId;
  const rawAccountId = typeof queryAccountId === "string" ? queryAccountId.trim() : "";

  if (rawAccountId) {
    const where = /^[0-9]+$/.test(rawAccountId)
      ? { accountNumber: Number(rawAccountId) }
      : { id: rawAccountId };
    const account = await prisma.account.findUnique({ where: where as any });

    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (user.role === UserRole.fieldOfficer && account.assignedOfficerId !== user.userId) {
      return res.status(403).json({ error: "Account not assigned to you." });
    }

    const visits = await prisma.visit.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(
      visits.map((visit) => ({
        id: visit.id,
        accountId: visit.accountId,
        remarkType: visit.remarkType,
        housePhoto: visit.housePhoto ?? undefined,
        clientPhoto: visit.clientPhoto ?? undefined,
        additionalPhotos: visit.additionalPhotos ? JSON.parse(visit.additionalPhotos) : undefined,
        ptpAmount: visit.ptpAmount ?? undefined,
        ptpDate: visit.ptpDate?.toISOString().slice(0, 10),
        scheduledDate: visit.scheduledDate?.toISOString().slice(0, 10),
        notes: visit.notes ?? undefined,
        gpsVerified: visit.gpsVerified,
        createdAt: visit.createdAt.toISOString(),
      })),
    );
  }

  const whereClause = user.role === UserRole.fieldOfficer
    ? { officerId: user.userId }
    : undefined;

  const visits = await prisma.visit.findMany({
    where: whereClause,
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    visits
      .filter((visit) => visit.ptpDate || visit.scheduledDate)
      .map((visit) => ({
        id: visit.id,
        accountId: visit.accountId,
        debtorName: visit.account?.debtorName ?? "",
        accountNumber: visit.account?.accountNumber,
        remarkType: visit.remarkType,
        housePhoto: visit.housePhoto ?? undefined,
        clientPhoto: visit.clientPhoto ?? undefined,
        additionalPhotos: visit.additionalPhotos ? JSON.parse(visit.additionalPhotos) : undefined,
        ptpAmount: visit.ptpAmount ?? undefined,
        ptpDate: visit.ptpDate?.toISOString().slice(0, 10),
        scheduledDate: visit.scheduledDate?.toISOString().slice(0, 10),
        notes: visit.notes ?? undefined,
        gpsVerified: visit.gpsVerified,
        createdAt: visit.createdAt.toISOString(),
      })),
  );
});

visitsRouter.post("/", requireRole(UserRole.fieldOfficer), async (req, res) => {
  const user = req.user!;
  const {
    accountId,
    remarkType,
    housePhoto,
    clientPhoto,
    additionalPhotos,
    ptpAmount,
    ptpDate,
    scheduledDate,
    notes,
    gpsVerified,
  } = req.body as {
    accountId?: string;
    remarkType?: string;
    housePhoto?: string;
    clientPhoto?: string;
    additionalPhotos?: string[];
    ptpAmount?: number;
    ptpDate?: string;
    scheduledDate?: string;
    notes?: string;
    gpsVerified?: boolean;
  };

  const resolvedAccountId = accountId?.trim();
  if (!resolvedAccountId || !remarkType) {
    return res.status(400).json({ error: "accountId and remarkType are required." });
  }

  if (!isValidVisitRemarkType(remarkType)) {
    return res.status(400).json({ error: "Invalid remarkType." });
  }

  if (remarkRequiresScheduleDate(remarkType) && !scheduledDate) {
    return res.status(400).json({ error: "scheduledDate is required for this remark type." });
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

  const actionLabel =
    remarkType === VisitRemarkType.willing || remarkType === VisitRemarkType.responsed
      ? "Visit - PTP"
      : `Visit - ${remarkType.replace(/_/g, " ")}`;

  const visit = await prisma.$transaction(async (tx) => {
    const created = await tx.visit.create({
      data: {
        accountId: account.id,
        officerId: user.userId,
        remarkType: remarkType as VisitRemarkType,
        housePhoto: housePhoto ?? undefined,
        clientPhoto: clientPhoto ?? undefined,
        additionalPhotos: additionalPhotos ? JSON.stringify(additionalPhotos) : undefined,
        ptpAmount: ptpAmount ?? undefined,
        ptpDate: ptpDate ? new Date(ptpDate) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        notes: notes ?? undefined,
        gpsVerified: gpsVerified ?? false,
      },
    });

    await tx.accountHistory.create({
      data: {
        accountId: account.id,
        action: actionLabel,
        amount: ptpAmount ?? undefined,
        notes,
        createdBy: user.userId,
      },
    });

    await tx.account.update({
      where: { id: account.id },
      data: { status: mapRemarkToStatus(remarkType as VisitRemarkType) },
    });

    return created;
  });

  return res.status(201).json({
    id: visit.id,
    accountId: visit.accountId,
    remarkType: visit.remarkType,
    housePhoto: visit.housePhoto ?? undefined,
    clientPhoto: visit.clientPhoto ?? undefined,
    additionalPhotos: visit.additionalPhotos ? JSON.parse(visit.additionalPhotos) : undefined,
    ptpAmount: visit.ptpAmount ?? undefined,
    ptpDate: visit.ptpDate?.toISOString().slice(0, 10),
    scheduledDate: visit.scheduledDate?.toISOString().slice(0, 10),
    notes: visit.notes ?? undefined,
    gpsVerified: visit.gpsVerified,
    createdAt: visit.createdAt.toISOString(),
  });
});
