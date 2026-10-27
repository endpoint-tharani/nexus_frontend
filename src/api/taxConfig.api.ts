import api from "./axios";
import type {
  ApiEnvelope,
  CompanyTaxConfigResponse,
  CreateCustomFieldPayload,
  MessageResponse,
  SetStandardDeductionPayload,
  StandardDeductionResponse,
  UpsertSectionConfigPayload,
  ProofUploadWindowResponse,
} from "../types";

// Admin Tax Configuration — company-scoped. Reads are open to company members;
// writes are owner-only (verifyCompanyRootAccess) on the backend.

export const getCompanyTaxConfig = (companyId: string, year: number) =>
  api.get<CompanyTaxConfigResponse>("/tax/config/company", {
    params: { companyId, year },
  });

// Enable/disable/relabel/cap a master section for the company + FY. Returns the
// upserted overlay row; callers refetch the company config rather than read it.
export const upsertSectionConfig = (
  companyId: string,
  data: UpsertSectionConfigPayload
) =>
  api.put<ApiEnvelope<unknown>>("/tax/config/company/section", data, {
    params: { companyId },
  });

export const createCustomField = (
  companyId: string,
  data: CreateCustomFieldPayload
) =>
  api.post<ApiEnvelope<unknown>>("/tax/config/custom-field", data, {
    params: { companyId },
  });

export const deleteCustomField = (companyId: string, fieldId: string) =>
  api.delete<MessageResponse>("/tax/config/custom-field", {
    params: { companyId, fieldId },
  });

// --- Standard deduction override (per-company) ---

export const getStandardDeduction = (companyId: string, year: number) =>
  api.get<StandardDeductionResponse>("/tax/config/standard-deduction", {
    params: { companyId, year },
  });

export const setStandardDeduction = (
  companyId: string,
  data: SetStandardDeductionPayload
) =>
  api.put<StandardDeductionResponse>("/tax/config/standard-deduction", data, {
    params: { companyId },
  });

export const getProofUploadWindow = (companyId: string, year: number) =>
  api.get<ProofUploadWindowResponse>("/tax/settings/proof-upload-window", {
    params: { companyId, year },
  });

export const patchProofUploadWindow = (
  companyId: string,
  year: number,
  proofUploadOpen: boolean
) =>
  api.patch<ProofUploadWindowResponse>(
    "/tax/settings/proof-upload-window",
    { proofUploadOpen },
    {
      params: { companyId, year },
    }
  );
