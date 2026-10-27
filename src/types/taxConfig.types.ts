// Types for the admin Tax Configuration screen. Mirror the backend
// `getCompanyConfig` service response and the config mutation bodies exactly.

import type { ApiEnvelope } from "./common.types";

export type TaxFieldType =
  | "TEXT"
  | "NUMBER"
  | "AMOUNT"
  | "DATE"
  | "DROPDOWN"
  | "RADIO"
  | "CHECKBOX"
  | "FILE"
  | "TEXTAREA";

export type TaxSectionCategory =
  | "INCOME"
  | "DEDUCTION"
  | "EXEMPTION"
  | "PREVIOUS_EMPLOYER"
  | "CUSTOM";

export interface TaxFieldOption {
  value: string;
  label: string;
}

// One master deduction/exemption section paired with this company's effective
// overlay (enabled / relabelled / reordered / capped).
export interface CompanyConfigSection {
  sectionId: string;
  code: string;
  masterLabel: string;
  shortName: string;
  category: TaxSectionCategory;
  allowedOld: boolean;
  allowedNew: boolean;
  statutoryCap: number | null;
  multiEntry: boolean;
  fieldCount: number;
  // Effective (resolved) values shown in the toggle row:
  isEnabled: boolean;
  label: string;
  sortOrder: number;
  maxEntries: number | null;
  cap: number | null;
  hasOverride: boolean;
}

// A company-specific custom declaration field.
export interface CompanyCustomField {
  id: string;
  sectionId: string | null;
  fieldKey: string;
  label: string;
  fieldType: TaxFieldType;
  isRequired: boolean;
  maxAmount: number | null;
  options: TaxFieldOption[];
}

export interface CompanyTaxConfig {
  financialYear: { start: number; end: number; label: string };
  sections: CompanyConfigSection[];
  customFields: CompanyCustomField[];
}

// Per-company standard deduction (effective values: override if set, else the
// global statutory amount per regime).
export interface StandardDeduction {
  oldRegime: number;
  newRegime: number;
}

// --- payloads ---------------------------------------------------------------

export interface UpsertSectionConfigPayload {
  sectionId: string;
  financialYearStart: number;
  financialYearEnd?: number | null;
  isEnabled: boolean;
  overrideLabel?: string | null;
  overrideSortOrder?: number | null;
  overrideMaxEntries?: number | null;
  overrideCap?: number | null;
}

export interface CreateCustomFieldPayload {
  sectionId?: string | null;
  fieldKey: string;
  label: string;
  fieldType: TaxFieldType;
  isRequired?: boolean;
  sortOrder?: number;
  placeholder?: string | null;
  helpText?: string | null;
  maxAmount?: number | null;
  financialYearStart?: number | null;
  options?: TaxFieldOption[];
}

export interface SetStandardDeductionPayload {
  financialYearStart: number;
  oldRegime: number;
  newRegime: number;
}

// --- responses ---
export type CompanyTaxConfigResponse = ApiEnvelope<CompanyTaxConfig>;
export type StandardDeductionResponse = ApiEnvelope<StandardDeduction>;

export interface ProofUploadWindow {
  proofUploadOpen: boolean;
}

export type ProofUploadWindowResponse = ApiEnvelope<ProofUploadWindow>;
