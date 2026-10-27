import type { AxiosRequestConfig } from "axios";
import api from "./axios";
import type { TaxRegime } from "../constants";
import type {
  DeclarationFilters,
  MessageResponse,
  ProofPayload,
  RejectDeclarationPayload,
  TaxDeclarationListResponse,
  TaxDeclarationResponse,
  TaxSummaryResponse,
  TaxWorkingSheetResponse,
  EmployeeStructuredDeclarationResponse,
  StructuredDocument,
  UpsertEntryPayload,
} from "../types";
import type { ApiEnvelope } from "../types/common.types";

// Admin tax routes — company-scoped (?companyId).
// ✅ approve / reject / proof are owner-only (verifyCompanyRootAccess).

// --- tracking / reads ---
export const getDeclarations = (
  companyId: string,
  year: number,
  filters?: DeclarationFilters
) =>
  api.get<TaxDeclarationListResponse>("/tax/declarations", {
    params: { companyId, year, ...filters },
  });

export const getTaxSummary = (companyId: string, year: number) =>
  api.get<TaxSummaryResponse>("/tax/summary", {
    params: { companyId, year },
  });

export const getDeclaration = (companyId: string, declarationId: string) =>
  api.get<TaxWorkingSheetResponse>("/tax/declaration", {
    params: { companyId, declarationId },
  });

// Opens a declaration for an employee who never started one, so the admin can
// file on their behalf. Idempotent — returns the existing sheet if there is one.
export const createDeclarationAdmin = (
  companyId: string,
  employeeId: string,
  year: number
) =>
  api.post<TaxWorkingSheetResponse>("/tax/declaration", {}, {
    params: { companyId, employeeId, year },
  });

// --- exports: stream .xlsx, request as a blob ---
export const exportTracking = (companyId: string, year: number) =>
  api.get<Blob>("/tax/export/tracking", {
    params: { companyId, year },
    responseType: "blob",
  });

export const exportDeclaration = (companyId: string, declarationId: string) =>
  api.get<Blob>("/tax/export/declaration", {
    params: { companyId, declarationId },
    responseType: "blob",
  });

// --- workflow (owner-only) ---
export const approveDeclaration = (companyId: string, declarationId: string) =>
  api.patch<TaxDeclarationResponse>("/tax/approve", {}, {
    params: { companyId, declarationId },
  });

export const rejectDeclaration = (
  companyId: string,
  declarationId: string,
  reason: string
) =>
  api.patch<TaxDeclarationResponse>(
    "/tax/reject",
    { reason } satisfies RejectDeclarationPayload,
    { params: { companyId, declarationId } }
  );

export const upsertProof = (
  companyId: string,
  declarationId: string,
  data: ProofPayload
) =>
  api.post<TaxDeclarationResponse>("/tax/proof", data, {
    params: { companyId, declarationId },
  });

export const removeProof = (
  companyId: string,
  declarationId: string,
  itemId: string,
  removeItem?: boolean
) =>
  api.delete<MessageResponse>("/tax/proof", {
    params: { companyId, declarationId, itemId, removeItem },
  });

export const upsertTaxEntryAdmin = (
  companyId: string,
  declarationId: string,
  year: number,
  data: UpsertEntryPayload
) =>
  api.put<EmployeeStructuredDeclarationResponse>("/tax/declaration/entry", data, {
    params: { companyId, declarationId, year },
  });

export const deleteTaxEntryAdmin = (
  companyId: string,
  declarationId: string,
  year: number,
  entryId: string
) =>
  api.delete<EmployeeStructuredDeclarationResponse>("/tax/declaration/entry", {
    params: { companyId, declarationId, year, entryId },
  });

export const uploadTaxDocumentAdmin = (
  companyId: string,
  declarationId: string,
  year: number,
  sectionCode: string,
  file: File,
  entryId?: string,
  config?: AxiosRequestConfig
) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<ApiEnvelope<StructuredDocument>>("/tax/declaration/document", form, {
    params: { companyId, declarationId, year, sectionCode, ...(entryId ? { entryId } : {}) },
    ...config,
    headers: {
      "Content-Type": "multipart/form-data",
      ...config?.headers,
    },
  });
};

export const deleteTaxDocumentAdmin = (
  companyId: string,
  declarationId: string,
  documentId: string
) =>
  api.delete("/tax/declaration/document", {
    params: { companyId, declarationId, documentId },
  });

export const updateDeclarationRegimeAdmin = (
  companyId: string,
  declarationId: string,
  year: number,
  regime: TaxRegime
) =>
  api.patch<TaxWorkingSheetResponse>("/tax/declaration/regime", { regime }, {
    params: { companyId, declarationId, year },
  });
