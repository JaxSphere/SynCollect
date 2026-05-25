import { Router } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.use(requireRole(UserRole.manager, UserRole.admin));

dashboardRouter.get("/", async (_req, res) => {
  // ── Account KPIs ──────────────────────────────────────────────────────────
  const [totalAccounts, ptpAccounts, totalOfficers, balanceAgg, statusCounts] =
    await Promise.all([
      prisma.account.count(),
      prisma.account.count({ where: { status: "ptp" } }),
      prisma.user.count({ where: { role: UserRole.fieldOfficer } }),
      prisma.account.aggregate({ _sum: { balance: true } }),
      prisma.account.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

  const totalBalance = Number(balanceAgg._sum.balance ?? 0);
  const collectionRate =
    totalAccounts > 0 ? Math.round((ptpAccounts / totalAccounts) * 100) : 0;

  const statusMap: Record<string, number> = {};
  for (const row of statusCounts) {
    statusMap[row.status] = row._count._all;
  }

  // ── Monthly collections (last 6 months) ────────────────────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentVisits = await prisma.visit.findMany({
    where: {
      ptpAmount: { not: null },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { ptpAmount: true, createdAt: true },
  });

  // Build a map keyed by "YYYY-MM"
  const monthlyMap: Record<string, number> = {};
  for (const v of recentVisits) {
    const key = `${v.createdAt.getFullYear()}-${String(v.createdAt.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(v.ptpAmount);
  }

  // Fill every month in the window (even if zero)
  const now = new Date();
  const monthlyCollections: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthlyCollections.push({ month: label, amount: Math.round(monthlyMap[key] ?? 0) });
  }

  // ── Field officer performance ───────────────────────────────────────────────
  const officers = await prisma.user.findMany({
    where: { role: UserRole.fieldOfficer },
    orderBy: { fullName: "asc" },
    include: {
      assignedAccounts: { select: { id: true } },
      visits: {
        select: { id: true, ptpAmount: true },
      },
    },
  });

  const officerPerformance = officers.map((officer) => {
    const totalVisits = officer.visits.length;
    const ptpVisits = officer.visits.filter((v) => v.ptpAmount != null);
    const ptpCount = ptpVisits.length;
    const totalPtpAmount = ptpVisits.reduce(
      (sum, v) => sum + Number(v.ptpAmount),
      0,
    );
    const successRate =
      totalVisits > 0 ? Math.round((ptpCount / totalVisits) * 100) : 0;

    return {
      id: officer.id,
      name: officer.fullName ?? officer.username,
      username: officer.username,
      assignedAccounts: officer.assignedAccounts.length,
      totalVisits,
      ptpCount,
      totalPtpAmount: Math.round(totalPtpAmount * 100) / 100,
      successRate,
    };
  });

  return res.json({
    totalAccounts,
    totalBalance,
    ptpAccounts,
    totalOfficers,
    collectionRate,
    statusMap,
    monthlyCollections,
    officerPerformance,
  });
});
