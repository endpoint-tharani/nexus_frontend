import api from "./axios";
import type {
  Form16ListFilters,
  Form16ListResponse,
  Form16GenerateResponse,
  MessageResponse,
  ApiEnvelope,
  Form16SummaryResponse,
} from "../types";

export interface DownloadForm16Response {
  downloadUrl: string;
  fileName: string;
}

export const getForm16Summary = (companyId: string, year: number) =>
  api.get<Form16SummaryResponse>("/admin/form16/summary", {
    params: { companyId, financialYear: toFyString(year) },
  });

// Convert 2026 -> "2026-27"
const toFyString = (year: number): string => {
  const nextYearShort = String((year + 1) % 100).padStart(2, "0");
  return `${year}-${nextYearShort}`;
};

// Admin Form 16 routes — company-scoped (?companyId).
// Mount path in backend is /admin/form16

export const getForm16List = (
  companyId: string,
  year: number,
  filters?: Form16ListFilters
) =>
  api.get<Form16ListResponse>("/admin/form16", {
    params: {
      companyId,
      financialYear: toFyString(year),
      ...filters,
    },
  });

export const generateForm16 = (
  companyId: string,
  employeeId: string,
  year: number
) =>
  api.post<Form16GenerateResponse>(
    "/admin/form16/generate",
    { employeeId, financialYear: toFyString(year) },
    { params: { companyId } }
  );

export const generateBulkForm16 = (companyId: string, year: number) =>
  api.post<MessageResponse>(
    "/admin/form16/generate-bulk",
    { financialYear: toFyString(year) },
    { params: { companyId } }
  );

export const regenerateForm16 = (
  companyId: string,
  employeeId: string,
  year: number
) =>
  api.post<Form16GenerateResponse>(
    `/admin/form16/regenerate/${employeeId}`,
    { financialYear: toFyString(year) },
    { params: { companyId } }
  );

export const downloadForm16 = (
  companyId: string,
  id: string
) =>
  api.get<ApiEnvelope<DownloadForm16Response>>(`/admin/form16/download/${id}`, {
    params: { companyId },
  });
