import { apiFetch } from "./client";

export type AuditLogEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string | null;
  performedById: string | null;
  performedBy: string | null;
  details: string | null;
  createdAt: string;
};

export type AuditLogResponse = {
  logs: AuditLogEntry[];
  total: number;
};

export function fetchAuditLogs(params?: {
  limit?: number;
  offset?: number;
  targetType?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.targetType) query.set("targetType", params.targetType);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<AuditLogResponse>(`/api/audit-logs${qs ? `?${qs}` : ""}`);
}
