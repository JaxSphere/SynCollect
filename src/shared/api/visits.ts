import { apiFetch } from "./client";

export type VisitRemarkType =
  | 'willing'
  | 'responsed'
  | 'unlocated'
  | 'transfer_residence'
  | 'full_paid'
  | 'refuse_to_receive_and_sign'
  | 'for_follow_up'
  | 'dont_have_capacity_to_pay'
  | 'onhold_account'
  | 'difficult_to_reach_out'
  | 'moved_out'
  | 'refused';

export type CreateVisitRequest = {
  accountId: string;
  remarkType: VisitRemarkType;
  housePhoto?: string;
  clientPhoto?: string;
  additionalPhotos?: string[];
  ptpAmount?: number;
  ptpDate?: string;
  scheduledDate?: string;
  notes?: string;
  gpsVerified?: boolean;
};

export type VisitResponse = {
  id: string;
  accountId: string;
  remarkType: VisitRemarkType;
  housePhoto?: string;
  clientPhoto?: string;
  additionalPhotos?: string[];
  ptpAmount?: number;
  ptpDate?: string;
  scheduledDate?: string;
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

export async function fetchScheduledVisits(): Promise<VisitResponse[]> {
  return apiFetch<VisitResponse[]>("/api/visits");
}

export async function fetchAccountVisits(accountId: string | number): Promise<VisitResponse[]> {
  const encodedAccountId = encodeURIComponent(String(accountId).trim());
  return apiFetch<VisitResponse[]>(`/api/visits?accountId=${encodedAccountId}`);
}
