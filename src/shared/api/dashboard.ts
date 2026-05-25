import { apiFetch } from "./client";

export type OfficerPerformance = {
  id: string;
  name: string;
  username: string;
  assignedAccounts: number;
  totalVisits: number;
  ptpCount: number;
  totalPtpAmount: number;
  successRate: number;
};

export type DashboardStats = {
  totalAccounts: number;
  totalBalance: number;
  ptpAccounts: number;
  totalOfficers: number;
  collectionRate: number;
  statusMap: Record<string, number>;
  monthlyCollections: { month: string; amount: number }[];
  officerPerformance: OfficerPerformance[];
};

export function fetchDashboard(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/dashboard");
}
