// Domain + payload types for the Payroll module.

import type { PayComponentType, PayrollUploadType } from "../constants/enums";
import type { ApiEnvelope, Money, UploadUrlResponse } from "./common.types";

// A single line on a pay statement (earning or deduction).
export interface PayComponent {
  code: string;
  name: string;
  type: PayComponentType;
  amount: Money;
}

// One employee's pay for one run.
export interface PayrollEntry {
  id: string;
  runId: string;
  employeeId: string;
  // Denormalized employee snapshot for display (ASSUMPTION).
  employeeName?: string;
  employeeCode?: string;
  components: PayComponent[];
  grossEarnings?: Money;
  totalDeductions?: Money;
  netPay?: Money;
  daysInMonth?: number;
  effectiveWorkdays?: number;
  remarks?: string;
  // ASSUMPTION: a locked entry is read-only (e.g. the run is finalized/paid).
  // When true the UI disables editing/deleting and shows a lock indicator.
  locked?: boolean;
}

// A payroll run = one uploaded file for a (year, month, uploadType).
export interface PayrollRun {
  id: string;
  companyId: string;
  year: number;
  month: number;
  uploadType: PayrollUploadType;
  sourceFileKey?: string;
  status?: string;
  entryCount?: number;
  totalNetPay?: Money;
  remarks?: string;
  uploadedById?: string;
  uploadedBy?: { name?: string };
  createdAt?: string;
  salaryType?: "REGULAR" | "ARREARS";
  entries?: PayrollEntry[];
}

// --- payloads ---

// Register a run after the file is uploaded to S3.
export interface RegisterRunPayload {
  year: number;
  month: number;
  uploadType: PayrollUploadType;
  sourceFileKey: string;
  replace?: boolean;
  salaryType?: "REGULAR" | "ARREARS";
}

// POST /payroll/upload returns a parse summary, NOT a full run. `created`/`skipped`
// count the rows; `unmatchedEmployeeCodes` are spreadsheet rows whose employee code
// didn't match an existing employee; `warnings` are non-fatal parse notes.
export interface PayrollUploadResult {
  runId: string;
  created: number;
  skipped: number;
  unmatchedEmployeeCodes: string[];
  warnings: string[];
}

// Edit one entry (full component list replace).
export interface UpdateEntryPayload {
  components: PayComponent[];
  daysInMonth?: number;
  effectiveWorkdays?: number;
  remarks?: string;
}

// Filters for the runs list.
export interface PayrollRunFilters {
  year?: number;
  month?: number;
  uploadType?: PayrollUploadType;
  salaryType?: string;
}

// --- pay statement (financial-year view, with projection) ---
//
// Shape matches GET /payroll/pay-statement exactly. The endpoint returns all 12
// FY months: unpaid months are PROJECTED (from the salary structure, else the
// average of paid months, else zero). A month's `components` is a flat
// { code: amount } map — the display name + EARNING/DEDUCTION type for each code
// live in `componentTotals`, so join on `code` to render a typed breakdown.

// Whether a month's figures are real payroll (ACTUAL) or an estimate (PROJECTED).
export type PayStatementSource = "ACTUAL" | "PROJECTED" | "BEFORE_JOINING";

// How projected months were estimated: from the employee's salary STRUCTURE,
// the latest regular payroll (LAST_REGULAR_PAYROLL), or NONE (no basis -> zeros).
export type ProjectionBasis = "STRUCTURE" | "LAST_REGULAR_PAYROLL" | "NONE";

// The gross / deductions / net rollup block, reused for months and FY totals.
export interface PayStatementTotals {
  gross: Money;
  totalDeductions: Money;
  netPay: Money;
}

export interface PayStatementSection {
  gross: Money;
  totalDeductions: Money;
  netPay: Money;
  components: Record<string, Money>;
}

export interface PayStatementMonth extends PayStatementTotals {
  year: number;
  month: number;
  label: string; // e.g. "APR-2025"
  source: PayStatementSource;
  // code -> amount; names/types resolved via `componentTotals`.
  components: Record<string, Money>;
  regular?: PayStatementSection;
  arrears?: PayStatementSection;
}

// One row of the component-wise FY rollup. Carries the display name + type that
// the per-month `components` map lacks, plus actual/projected/total splits.
export interface PayStatementComponentTotal {
  code: string;
  name: string;
  type: PayComponentType;
  actual: Money;
  projected: Money;
  total: Money;
}

export interface PayStatement {
  employee: { id: string; employeeCode: string; name: string };
  financialYear: { start: number; end: number; startMonth: number };
  uploadType: PayrollUploadType;
  paidMonths: number;
  projectionBasis: ProjectionBasis;
  months: PayStatementMonth[];
  componentTotals: PayStatementComponentTotal[];
  totals: {
    actual: PayStatementTotals;
    projected: PayStatementTotals;
    grandTotal: PayStatementTotals;
  };
}

// --- responses ---
export type UploadUrlEnvelope = ApiEnvelope<UploadUrlResponse>;
// POST /payroll/upload-file (server-side S3 proxy) returns just the object key.
export type PayrollFileKeyResponse = ApiEnvelope<{ key: string }>;
export type SalaryIncomeFileKeyResponse = ApiEnvelope<{
  key?: string;
  fileKey?: string;
  sourceFileKey?: string;
}>;
export interface SalaryIncomeUploadResult {
  created?: number;
  skipped?: number;
  unmatchedEmployeeCodes?: string[];
  warnings?: string[];
}
export type PayrollUploadResultResponse = ApiEnvelope<PayrollUploadResult>;
export type PayrollRunResponse = ApiEnvelope<PayrollRun>;
export type PayrollRunListResponse = ApiEnvelope<PayrollRun[]>;
export type PayrollEntryResponse = ApiEnvelope<PayrollEntry>;
export type PayStatementResponse = ApiEnvelope<PayStatement>;

export type SalaryImportType = "SALARY" | "BONUS" | "INCENTIVE" | "GRATUITY" | "PREVIOUS_EMPLOYMENT" | "EL_ENCASHMENT" | "ARREARS";

export interface SalaryImportFilters {
  year?: number;
  month?: number;
  fyStartYear?: number;
  uploadType?: string;
  status?: string;
  salaryType?: string;
}

export interface GratuityRecord {
  id: string;
  companyId: string;
  employeeId: string;
  joiningDate: string;
  leavingDate: string;
  lastDrawnSalary: string | number;
  completedService: number;
  gratuityAmount: string | number;
  remarks?: string | null;
  employee?: {
    id: string;
    name: string;
    employeeCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ELEncashmentRecord {
  id: string;
  companyId: string;
  employeeId: string;
  financialYear: number;
  leaveDaysEncashed: string | number;
  averageMonthlySalary: string | number;
  yearsOfService: string | number;
  isGovernmentEmployee: boolean;
  encashmentAmount: string | number;
  exemptAmount: string | number;
  taxableAmount: string | number;
  remarks?: string | null;
  employee?: {
    id: string;
    name: string;
    employeeCode: string;
    joinDate?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// --- TDS Deduction History ---

/** One month's TDS entry as returned by GET /payroll/tds-history */
export interface TdsHistoryRow {
  month: number;
  year: number;
  runId: string;
  tdsAmount: number;
  runningTotal: number;
  status: "PAID";
}

export type TdsHistoryResponse = ApiEnvelope<TdsHistoryRow[]>;

// --- Payroll Import Preview ---

export interface PreviewPayrollRow {
  employeeCode: string;
  name: string;
  gross: number;
  tds: number;
  net: number;
}

export interface PreviewPayrollResult {
  rows: PreviewPayrollRow[];
  warnings: string[];
}

export type PreviewPayrollResponse = ApiEnvelope<PreviewPayrollResult>;

// --- Arrears Salary Upload ---

export interface SalaryArrearRecord {
  id: string;
  companyId: string;
  employeeId: string;
  year: number;
  month: number;
  amount: number | string;
  uploadedById: string;
  sourceFileKey: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    name: string;
    employeeCode: string;
  };
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface ArrearRowError {
  sourceRow: number;
  employeeCode: string;
  reason: string;
}

export interface UploadArrearsResult {
  processed: number;
  skipped: number;
  errors: ArrearRowError[];
  warnings: string[];
}


