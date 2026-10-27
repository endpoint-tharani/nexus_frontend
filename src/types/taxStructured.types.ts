// Types for the STRUCTURED tax engine (dynamic forms + entries) used by the
// employee declaration's income heads (House Property, Other Sources). Mirror
// the backend `resolveFormSchema` and `getEmployeeDeclaration` responses.

import type { DeclarationStatus, TaxRegime } from "../constants/enums";
import type { ApiEnvelope } from "./common.types";
import type {
  TaxFieldOption,
  TaxFieldType,
  TaxSectionCategory,
} from "./taxConfig.types";

// One renderable field in a section (template field or company custom field).
export interface StructuredFormField {
  fieldKey: string;
  label: string;
  fieldType: TaxFieldType;
  isRequired: boolean;
  sortOrder: number;
  placeholder?: string | null;
  helpText?: string | null;
  validationRules?: Record<string, unknown> | null;
  maxAmount?: number | null;
  options: TaxFieldOption[];
  isCustom: boolean;
}

// A section as the employee sees it after the company overlay + regime gate.
export interface StructuredFormSection {
  sectionId: string;
  code: string;
  label: string;
  shortName: string;
  description?: string | null;
  category: TaxSectionCategory;
  sortOrder: number;
  allowedOld: boolean;
  allowedNew: boolean;
  multiEntry: boolean;
  maxEntries?: number | null;
  cap?: number | null;
  groupInto80C: boolean;
  computedSeparately: boolean;
  fields: StructuredFormField[];
}

export interface FinancialYearInfo {
  start: number;
  end: number;
  label: string;
  startMonth?: number;
  paidMonths?: number;
  remainingMonths?: number;
}

export interface TaxFormSchema {
  financialYear: FinancialYearInfo;
  regime: TaxRegime;
  sections: StructuredFormSection[];
}

// --- declaration view -------------------------------------------------------

export interface StructuredDocument {
  id: string;
  fileName: string;
  mimeType: string;
  s3Key: string;
  url?: string;
  createdAt: string;
  fileSize?: number;
}

export interface StructuredEntry {
  id: string;
  sectionId: string;
  sectionCode: string;
  entryIndex: number;
  computedAmount: number;
  status: string;
  values: Record<string, string>;
  documents: StructuredDocument[];
}

export interface StructuredChapterLine {
  code: string;
  label: string;
  declared: number;
  allowed: number;
}

export interface StructuredSummary {
  regime: TaxRegime;
  income: {
    grossSalary: number;
    hraExemption: number;
    incomeFromSalary: number;
    previousEmployment: number;
    houseProperty: number;
    otherSources: number;
    grossTotalIncome: number;
  };
  deductions: {
    standardDeduction: number;
    professionalTax: number;
    homeLoanInterest: number;
    chapterVIA: StructuredChapterLine[];
    chapterVIATotal: number;
    hraExemption: number;
  };
  computation: {
    grandTotalSalary: number;
    grossTotalIncome: number;
    taxableIncome: number;
    taxBeforeRebate: number;
    rebate87A: number;
    surcharge: number;
    cess: number;
    totalTaxPayable: number;
    tdsDeducted: number;
    balanceTaxPayable: number;
    recommendedMonthlyTds?: number;
    employeePfFromPayroll?: number;
    manual80CInvestments?: number;
    gross80CBeforeLimit?: number;
    eligible80C?: number;
  };
  totals: { totalDeclaredIncome: number; totalDeclaredDeductions: number };
}

export interface StructuredSalary {
  grandTotalSalary: number;
  basicAnnual: number;
  hraAnnual: number;
  conveyanceAnnual: number;
  medicalAnnual: number;
  specialAllowanceAnnual: number;
  communicationAnnual: number;
  otherAllowanceAnnual: number;
  bonusAnnual: number;
  incentiveAnnual?: number;
  professionalTaxAnnual: number;
  tdsDeducted: number;
  gratuityAmount?: number;
  gratuityRemarks?: string | null;
  elEncashmentAmount?: number;
  elEncashmentRemarks?: string | null;
  previousEmploymentSalary?: number;
}

export interface EmployeeStructuredDeclaration {
  declarationId: string;
  status: DeclarationStatus;
  regime: TaxRegime;
  financialYear: FinancialYearInfo;
  locked: boolean;
  lockedAt: string | null;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string | null;
    pan: string | null;
  };
  salary: StructuredSalary;
  entries: StructuredEntry[];
  summary: StructuredSummary;
  review: {
    submittedAt: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
  };
}

// --- payloads ---------------------------------------------------------------

export interface EntryFieldValue {
  fieldKey: string;
  value: string;
}

export interface UpsertEntryPayload {
  sectionId: string;
  entryId?: string;
  regime?: TaxRegime;
  fieldValues: EntryFieldValue[];
}

// --- responses ---
export type TaxFormSchemaResponse = ApiEnvelope<TaxFormSchema>;
export type EmployeeStructuredDeclarationResponse =
  ApiEnvelope<EmployeeStructuredDeclaration>;
