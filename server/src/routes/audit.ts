import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";

export const auditRouter = Router();

auditRouter.use(requireAuth);
auditRouter.use(requireRole(UserRole.admin));

auditRouter.get("/", async (req, res) => {
  const { limit = "100", offset = "0", targetType, search } = req.query;

  const where: Record<string, unknown> = {};
  if (targetType && typeof targetType === "string") {
    where.targetType = targetType.toUpperCase();
  }
  if (search && typeof search === "string") {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { targetName: { contains: search, mode: "insensitive" } },
      { performedBy: { contains: search, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    (prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(limit), 500),
      skip: Number(offset),
    }),
    (prisma as any).auditLog.count({ where }),
  ]);

  return res.json({ logs, total });
});
