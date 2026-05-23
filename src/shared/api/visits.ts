import { apiClient } from "./client";

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
  const response = await apiClient.post("/api/visits", payload);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create visit" }));
    throw new Error(error.error || "Failed to create visit");
  }
  return response.json();
}
