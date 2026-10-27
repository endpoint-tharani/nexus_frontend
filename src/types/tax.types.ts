// Domain + payload types for the Tax modules
// (admin tracking/approval AND employee self-service).

import type {
  DeclarationStatus,
  TaxRegime,
  TaxSection,
  Form16Status,
} from "../constants/enums";
import type { ApiEnvelope, Money } from "./common.types";
import type { StructuredEntry } from "./taxStructured.types";

// A single declared deduction item within a declaration.
export interface TaxProofItem {
  id: string;
  section: TaxSection;
  amount: Money;
  description?: string;
  referenceNo?: string;
  proofDocKey?: string;
  // Convenience URL when the backend resolves a viewable link (ASSUMPTION).
  proofDocUrl?: string;
}

// An employee's tax declaration for a financial year.
//
// This is the FLAT shape the whole UI is built around. The single-declaration
// endpoints don't return it directly — they return `TaxWorkingSheet` (below),
// which `mapWorkingSheetToDeclaration` flattens into this. The admin LIST
// endpoint, however, returns this shape as-is.
export interface TaxDeclaration {
  id: string;
  companyId?: string;
  employeeId: string;
  // Denormalized employee snapshot for the admin tables.
  employeeName?: string;
  employeeCode?: string;
  year: number;
  regime: TaxRegime;
  status: DeclarationStatus;
  items: TaxProofItem[];
  totalDeclared?: Money;
  entries?: StructuredEntry[];
  raw?: TaxWorkingSheet;
  estimatedTax?: Money;
  taxableIncome?: Money;
  // Enriched figures the admin list/working-sheet expose for the tracking table
  // and the detail dialog (populated by the two mappers; optional because not
  // every source carries them).
  grandTotalSalary?: Money;
  tdsDeducted?: Money;
  balanceTaxPayable?: Money;
  proofCount?: number;
  itemCount?: number;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- admin tracking list row -------------------------------------------------
//
// Exact shape returned by GET /tax/declarations (backend `toTrackingRow`). It is
// NOT the flat `TaxDeclaration` — note `declarationId` (not `id`) and
// `financialYearStart` (not `year`). `mapTrackingRowToDeclaration` flattens it
// into the `TaxDeclaration` the table/dialogs consume, so the id/year remapping
// lives in exactly one place.
export interface TaxTrackingRow {
  declarationId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string | null;
  regime: TaxRegime;
  financialYearStart: number;
  financialYearEnd: number;
  status: DeclarationStatus;
  grandTotalSalary: number;
  taxableIncome: number;
  totalTaxPayable: number;
  tdsDeducted: number;
  balanceTaxPayable: number;
  itemCount: number;
  proofCount: number;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

// --- raw single-declaration response (the "income-tax working sheet") --------
//
// Exact shape returned by GET /tax/declaration, GET /me/tax/declaration and the
// proof/approve/reject/submit mutations (backend `buildTaxWorkingSheet`). It is
// nested, not flat: employee/financialYear/computation/review are sub-objects
// and money columns arrive as plain numbers. `mapWorkingSheetToDeclaration`
// turns this into the flat `TaxDeclaration` the UI consumes — only the fields
// the UI actually reads are typed here; the rest of the sheet is ignored.
export interface TaxWorkingSheetItem {
  id: string;
  section: TaxSection;
  amount: Money;
  description?: string | null;
  referenceNo?: string | null;
  proofDocKey?: string | null;
  // Enrichments the working-sheet builder adds (non-breaking — the mapper that
  // flattens to TaxProofItem reads a subset and ignores these).
  sectionLabel?: string;
  hasProof?: boolean;
  metadata?: Record<string, unknown> | null;
}

// Per-component annual salary, derived from payroll (read-only in the UI).
export interface WorkingSheetSalary {
  basicAnnual: Money;
  hraAnnual: Money;
  conveyanceAnnual: Money;
  medicalAnnual: Money;
  specialAllowanceAnnual: Money;
  communicationAnnual: Money;
  otherAllowanceAnnual: Money;
  bonusAnnual: Money;
  incentiveAnnual?: Money;
  gratuityAmount?: Money;
  gratuityRemarks?: string | null;
  elEncashmentAmount?: Money;
  elEncashmentRemarks?: string | null;
  previousEmploymentSalary?: Money;
  grandTotalSalary: Money;
}

export interface WorkingSheetIncome {
  grossSalary: Money;
  hraExemption: Money;
  incomeFromSalary: Money;
  previousEmployment: Money;
  houseProperty: Money;
  otherSources: Money;
  grossTotalIncome: Money;
}

// HRA inputs (employee-editable) + the computed exemption (read-only).
export interface WorkingSheetHra {
  residenceLocation: string | null;
  monthlyRent: Money | null;
  fromMonth: string | null;
  toMonth: string | null;
  landlordName: string | null;
  landlordPan: string | null;
  exemption: Money;
}

// One Chapter VI-A line: what the employee declared vs. what the engine allowed
// after applying regime gates and statutory caps.
export interface ChapterVIALine {
  section: TaxSection;
  label: string;
  declared: Money;
  allowed: Money;
}

export interface WorkingSheetDeductions {
  standardDeduction: Money;
  professionalTaxAnnual: Money;
  housingLoanInterest: Money;
  otherIncome: Money;
  chapterVIA: ChapterVIALine[];
  chapterVIATotal: Money;
}

export interface WorkingSheetComputation {
  grandTotalSalary: Money;
  grossTotalIncome: Money;
  taxableIncome: Money;
  taxBeforeRebate: Money;
  rebate87A: Money;
  surcharge: Money;
  cess: Money;
  totalTaxPayable: Money;
  tdsDeducted: Money;
  balanceTaxPayable: Money;
  recommendedMonthlyTds?: Money;
}

export interface TaxWorkingSheet {
  declarationId: string;
  status: DeclarationStatus;
  regime: TaxRegime;
  financialYear: { start: number; end: number; label: string; startMonth?: number; paidMonths?: number; remainingMonths?: number };
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string | null;
    pan: string | null;
  };
  salary?: WorkingSheetSalary;
  income?: WorkingSheetIncome;
  hra?: WorkingSheetHra;
  deductions?: WorkingSheetDeductions;
  computation?: WorkingSheetComputation;
  items: TaxWorkingSheetItem[];
  review?: {
    submittedAt?: string | null;
    approvedAt?: string | null;
    rejectionReason?: string | null;
  };
  totals?: {
    totalDeclaredIncome: Money;
    totalDeclaredDeductions: Money;
  };
  entries?: StructuredEntry[];
}

// A "not yet begun" pseudo-status the summary grid uses for employees who have
// no declaration row for the year (distinct from the four real workflow states).
export const NOT_STARTED = "NOT_STARTED";

// One employee's coverage in the summary grid. `status` is a real
// `DeclarationStatus` once they begin, else "NOT_STARTED".
export interface TaxSummaryGridRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string | null;
  status: DeclarationStatus | typeof NOT_STARTED;
  declarationId: string | null;
  grandTotalSalary: number | null;
  totalTaxPayable: number | null;
  balanceTaxPayable: number | null;
  proofCount: number;
  submittedAt: string | null;
  approvedAt: string | null;
}

// Aggregated dashboard numbers for a company + year. Mirrors backend
// `getSummary` exactly: per-status counts (suffixed `Count`), the employee
// coverage grid, and the resolved financial year.
export interface TaxSummary {
  financialYear: { start: number; end: number; label: string; startMonth?: number; paidMonths?: number };
  totalEmployees: number;
  draftCount: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  notStartedCount: number;
  grid: TaxSummaryGridRow[];
}

// --- payloads (shared by admin /tax/proof and self-service /me/tax/proof) ---

// Add or update a proof item. `itemId` present => update.
export interface ProofPayload {
  itemId?: string;
  section: TaxSection;
  amount: Money;
  description?: string;
  referenceNo?: string;
  proofDocKey?: string;
}

// Self-service declaration edit. Mirrors the backend `updateMyDeclaration`
// schema body exactly: regime switch, the HRA rent inputs, home-loan interest,
// other income, and bulk proof-item edits.
export interface UpdateMyDeclarationPayload {
  regime?: TaxRegime;
  residenceLocation?: string | null;
  monthlyRent?: number | null;
  fromMonth?: string | null;
  toMonth?: string | null;
  landlordName?: string | null;
  landlordPan?: string | null;
  housingLoanInterest?: number;
  otherIncome?: number;
  items?: ProofPayload[];
}

export interface RejectDeclarationPayload {
  reason: string;
}

// Filters for the admin declarations list.
export interface DeclarationFilters {
  status?: DeclarationStatus;
  employeeId?: string;
}

// Values produced by the self-service proof editor form.
export interface ProofFormValues {
  section: TaxSection;
  amount: string;
  description: string;
  referenceNo: string;
}

// --- responses ---
export type TaxDeclarationResponse = ApiEnvelope<TaxDeclaration>;
export type TaxWorkingSheetResponse = ApiEnvelope<TaxWorkingSheet>;
// The admin list endpoint returns condensed tracking rows, not flat declarations.
export type TaxDeclarationListResponse = ApiEnvelope<TaxTrackingRow[]>;
export type TaxSummaryResponse = ApiEnvelope<TaxSummary>;

export interface PreviousEmployment {
  id: string;
  employeeId?: string;
  employee?: {
    id: string;
    name: string;
    employeeCode: string;
  } | null;
  financialYearStart: number;
  financialYearEnd: number;
  employerName: string;
  employerTan?: string | null;
  employerPan?: string | null;
  employmentFrom: string;
  employmentTo: string;
  grossSalary: number;
  taxableSalary: number;
  professionalTax: number;
  tdsDeducted: number;
  otherIncome: number;
  remarks?: string | null;
  form16Attachment?: string | null;
  salarySlipAttachment?: string | null;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type PreviousEmploymentResponse = ApiEnvelope<PreviousEmployment>;
export type PreviousEmploymentListResponse = ApiEnvelope<PreviousEmployment[]>;

// --- Form 16 Generation ---
export interface Form16Record {
  id: string;
  companyId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  pan: string | null;
  departmentName: string | null;
  year: number;
  generatedAt: string | null;
  status: Form16Status;
  errorReason: string | null;
  s3Key: string | null;
}

export interface Form16Summary {
  financialYear: { start: number; end: number; label: string };
  totalEmployees: number;
  generatedCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface Form16ListFilters {
  status?: Form16Status;
  employeeId?: string;
  departmentId?: string;
}

export type Form16ListResponse = ApiEnvelope<Form16Record[]>;
export type Form16SummaryResponse = ApiEnvelope<Form16Summary>;
export type Form16GenerateResponse = ApiEnvelope<Form16Record>;

// --- Form 16 Viewer JSON DTO structures ---
export interface ChapterVIAOtherItem {
  code: string;
  label: string;
  declared: number;
  allowed: number;
}

export interface ExemptionOtherItem {
  code: string;
  label: string;
  amount: number;
}

export interface Form16ResponseDto {
  company: {
    name: string;
    pan: string;
    tan: string;
    address: string;
    email: string;
    phone: string;
  };
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    pan: string;
    designation: string;
    department: string;
    address: string;
  };
  financialYear: string;
  assessmentYear: string;
  period: {
    from: string;
    to: string;
  };
  taxRegime: "OLD" | "NEW";
  salary: {
    grossSalary: number;
    perquisites: number;
    profitsInLieu: number;
    salaryFromPreviousEmployer: number;
  };
  exemptions: {
    hra: number;
    lta: number;
    gratuity: number;
    leaveEncashment: number;
    otherExemptions: ExemptionOtherItem[];
  };
  section16: {
    standardDeduction: number;
    professionalTax: number;
    entertainmentAllowance: number;
  };
  otherIncome: {
    houseProperty: number;
    otherSources: number;
  };
  chapterVIA: {
    "80C": number;
    "80CCD1B": number;
    "80CCD2": number;
    "80D": number;
    "80E": number;
    "80G": number;
    "80TTA": number;
    other: ChapterVIAOtherItem[];
  };
  taxComputation: {
    grossTotalIncome: number;
    taxableIncome: number;
    tax: number;
    rebate87A: number;
    surcharge: number;
    cess: number;
    relief89: number;
    totalTax: number;
    tdsDeducted: number;
    balanceTax: number;
  };
  quarterlyTds: Array<{
    quarter: string;
    amountPaid: number;
    tds: number;
    deposited: number;
  }>;
  verification: {
    authorizedPerson: string;
    designation: string;
    place: string;
    date: string;
  };
}


