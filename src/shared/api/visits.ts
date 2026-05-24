import { apiFetch } from "./client";

export type VisitRemarkType = 'willing' | 'unlocated' | 'moved_out' | 'refused';

export type CreateVisitRequest = {
  accountId: string;
  remarkType: VisitRemarkType;
  ptpAmount?: number;
  ptpDate?: string;
  notes?: string;
  gpsVerified?: boolean;
};

export type VisitResponse = {
  id: string;
  accountId: string;
  remarkType: VisitRemarkType;
  ptpAmount?: number;
  ptpDate?: string;
  notes?: string;
  gpsVerified: boolean;
  createdAt: string;
};

export async function createVisit(payload: CreateVisitRequest): Promise<VisitResponse> {
  return apiFetch<VisitResponse>("/api/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
