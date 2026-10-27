import api from "./axios";
import type { TaxRegime } from "../constants";
import type {
  MessageResponse,
  ProofPayload,
  TaxDeclarationResponse,
  TaxWorkingSheetResponse,
  UpdateMyDeclarationPayload,
} from "../types";

// Employee self-service — operates on the logged-in user's own declaration.
// companyId is required: although these are token-scoped `/me/*` routes, the
// backend still scopes the declaration to a company and rejects the call with
// "Company ID is required" when it is missing. Callers (the hooks) supply it
// from the active company (useCompanyId).

export const getMyDeclaration = (
  companyId: string,
  year: number,
  regime?: TaxRegime
) =>
  api.get<TaxWorkingSheetResponse>("/me/tax/declaration", {
    params: { companyId, year, regime },
  });

export const updateMyDeclaration = (
  companyId: string,
  year: number,
  data: UpdateMyDeclarationPayload
) =>
  api.patch<TaxDeclarationResponse>("/me/tax/declaration", data, {
    params: { companyId, year },
  });

export const submitMyDeclaration = (companyId: string, year: number) =>
  api.post<TaxDeclarationResponse>("/me/tax/submit", {}, {
    params: { companyId, year },
  });

export const addMyProof = (
  companyId: string,
  declarationId: string,
  data: ProofPayload
) =>
  api.post<TaxDeclarationResponse>("/me/tax/proof", data, {
    params: { companyId, declarationId },
  });

export const removeMyProof = (
  companyId: string,
  declarationId: string,
  itemId: string,
  removeItem?: boolean
) =>
  api.delete<MessageResponse>("/me/tax/proof", {
    params: { companyId, declarationId, itemId, removeItem },
  });
