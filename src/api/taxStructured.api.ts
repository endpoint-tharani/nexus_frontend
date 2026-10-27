import type { AxiosRequestConfig } from "axios";
import api from "./axios";
import type { TaxRegime } from "../constants";
import type {
  EmployeeStructuredDeclarationResponse,
  StructuredDocument,
  TaxFormSchemaResponse,
  UpsertEntryPayload,
} from "../types";
import type { ApiEnvelope } from "../types/common.types";

// Employee self-service — STRUCTURED tax engine (dynamic forms + entries).
// companyId is passed for parity with the legacy /me/tax routes (the backend
// resolves the employee from the auth token; extra query keys are ignored).

export const getMyTaxForm = (
  companyId: string,
  year: number,
  regime?: TaxRegime
) =>
  api.get<TaxFormSchemaResponse>("/me/tax/form", {
    params: { companyId, year, regime },
  });

export const getMyStructuredDeclaration = (
  companyId: string,
  year: number,
  regime?: TaxRegime
) =>
  api.get<EmployeeStructuredDeclarationResponse>("/me/tax/structured", {
    params: { companyId, year, regime },
  });

// Create (entryId absent) or update (entryId present) one entry. Returns the
// full, freshly-recomputed declaration view.
export const upsertTaxEntry = (
  companyId: string,
  year: number,
  data: UpsertEntryPayload
) =>
  api.put<EmployeeStructuredDeclarationResponse>("/me/tax/entry", data, {
    params: { companyId, year },
  });

export const deleteTaxEntry = (
  companyId: string,
  year: number,
  entryId: string
) =>
  api.delete<EmployeeStructuredDeclarationResponse>("/me/tax/entry", {
    params: { companyId, year, entryId },
  });

export const uploadTaxDocument = (
  companyId: string,
  year: number,
  sectionCode: string,
  file: File,
  entryId?: string,
  config?: AxiosRequestConfig
) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<ApiEnvelope<StructuredDocument>>("/me/tax/document", form, {
    params: { companyId, year, sectionCode, ...(entryId ? { entryId } : {}) },
    ...config,
    headers: {
      "Content-Type": "multipart/form-data",
      ...config?.headers,
    },
  });
};

export const deleteTaxDocument = (companyId: string, documentId: string) =>
  api.delete("/me/tax/document", { params: { companyId, documentId } });
