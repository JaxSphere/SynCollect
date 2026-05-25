import { prisma } from "../db.js";

type AuditEntry = {
  action: string;
  targetType: "USER" | "ACCOUNT";
  targetId: string;
  targetName?: string;
  performedById?: string;
  performedBy?: string;
  details?: Record<string, unknown>;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await (prisma as any).auditLog.create({
      data: {
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        targetName: entry.targetName ?? null,
        performedById: entry.performedById ?? null,
        performedBy: entry.performedBy ?? null,
        details: entry.details ? JSON.stringify(entry.details) : null,
      },
    });
  } catch {
    // Never let audit logging break the main operation
  }
}
