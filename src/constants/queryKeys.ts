// Centralized TanStack Query key factory.
//
// One source of truth for every cache key so queries (Phase 3) and their
// invalidations never drift. Keys are hierarchical: invalidating a broader
// key (e.g. `payroll.runs(companyId)`) also matches its descendants.
//
// Usage:
//   useQuery({ queryKey: queryKeys.departments.list(companyId), ... })
//   queryClient.invalidateQueries({ queryKey: queryKeys.departments.all(companyId) })

import type {
  AttendanceStatus,
  DeclarationStatus,
  PayrollUploadType,
  RegularizationStatus,
  TaxRegime,
} from "./enums";

type EmployeeListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
};

type PayrollRunFilters = {
  year?: number;
  month?: number;
  uploadType?: PayrollUploadType;
};

type DeclarationFilters = {
  status?: DeclarationStatus;
  employeeId?: string;
};

type Form16ListFilters = {
  status?: string;
  employeeId?: string;
  departmentId?: string;
};

type AttendanceListFilters = {
  employeeId?: string;
  branchId?: string;
  status?: AttendanceStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

type RegularizationFilters = {
  employeeId?: string;
  status?: RegularizationStatus;
  page?: number;
  pageSize?: number;
};

type ShiftListFilters = {
  branchId?: string;
  type?: string;
  search?: string;
  includeInactive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
};

type ShiftReportFilters = {
  branchId?: string;
  shiftId?: string;
  search?: string;
};

type HolidayListFilters = {
  year?: number;
  month?: number;
  branchId?: string;
  type?: string;
  search?: string;
  includeInactive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
};

export const queryKeys = {
  // --- Departments (company-scoped) ---
  departments: {
    all: (companyId: string) => ["departments", companyId] as const,
    list: (
      companyId: string,
      filters?: { branchId?: string; departmentId?: string }
    ) => ["departments", companyId, "list", filters ?? {}] as const,
    detail: (companyId: string, id: string) =>
      ["departments", companyId, "detail", id] as const,
  },

  // --- Employees (company-scoped) ---
  employees: {
    all: (companyId: string) => ["employees", companyId] as const,
    list: (companyId: string, filters?: EmployeeListFilters) =>
      ["employees", companyId, "list", filters ?? {}] as const,
    detail: (companyId: string, id: string) =>
      ["employees", companyId, "detail", id] as const,
  },

  // --- Payroll (company-scoped) ---
  payroll: {
    all: (companyId: string) => ["payroll", companyId] as const,
    runs: (companyId: string, filters?: PayrollRunFilters) =>
      ["payroll", companyId, "runs", filters ?? {}] as const,
    run: (companyId: string, runId: string) =>
      ["payroll", companyId, "run", runId] as const,
    payStatement: (
      companyId: string,
      employeeId: string,
      year: number,
      uploadType?: PayrollUploadType
    ) =>
      [
        "payroll",
        companyId,
        "pay-statement",
        employeeId,
        year,
        uploadType ?? null,
      ] as const,
    tdsHistory: (companyId: string, employeeId: string, year: number) =>
      ["payroll", companyId, "tds-history", employeeId, year] as const,
    form16Detail: (companyId: string, employeeId: string, financialYear: string) =>
      ["payroll", companyId, "form16", "detail", employeeId, financialYear] as const,
  },

  // --- Tax administration (company-scoped, owner) ---
  tax: {
    all: (companyId: string) => ["tax", companyId] as const,
    declarations: (
      companyId: string,
      year: number,
      filters?: DeclarationFilters
    ) => ["tax", companyId, "declarations", year, filters ?? {}] as const,
    summary: (companyId: string, year: number) =>
      ["tax", companyId, "summary", year] as const,
    declaration: (companyId: string, declarationId: string) =>
      ["tax", companyId, "declaration", declarationId] as const,
  },

  // --- Form 16 (company-scoped) ---
  form16: {
    all: (companyId: string) => ["tax", companyId, "form16"] as const,
    list: (companyId: string, year: number, filters?: Form16ListFilters) =>
      ["tax", companyId, "form16", "list", year, filters ?? {}] as const,
    summary: (companyId: string, year: number) =>
      ["tax", companyId, "form16", "summary", year] as const,
  },

  // --- Employee self-service tax (token-scoped, but still company-scoped:
  // the `/me/tax/*` routes require the active companyId) ---
  myTax: {
    all: (companyId: string) => ["me", "tax", companyId] as const,
    declaration: (companyId: string, year: number, regime?: TaxRegime) =>
      ["me", "tax", companyId, "declaration", year, regime ?? null] as const,
  },

  // --- Configurable tax engine: employee structured declaration (income heads) ---
  myTaxStructured: {
    all: (companyId: string) => ["me", "taxStructured", companyId] as const,
    form: (companyId: string, year: number, regime?: TaxRegime) =>
      ["me", "taxStructured", companyId, "form", year, regime ?? null] as const,
    declaration: (companyId: string, year: number, regime?: TaxRegime) =>
      ["me", "taxStructured", companyId, "declaration", year, regime ?? null] as const,
  },

  // --- Configurable tax engine: admin company configuration (owner) ---
  taxConfig: {
    all: (companyId: string) => ["taxConfig", companyId] as const,
    company: (companyId: string, year: number) =>
      ["taxConfig", companyId, "company", year] as const,
    standardDeduction: (companyId: string, year: number) =>
      ["taxConfig", companyId, "standard-deduction", year] as const,
    proofUploadWindow: (companyId: string, year: number) =>
      ["taxConfig", companyId, "proof-upload-window", year] as const,
  },

  // --- Attendance (company-scoped) ---
  attendance: {
    all: (companyId: string) => ["attendance", companyId] as const,
    list: (companyId: string, filters?: AttendanceListFilters) =>
      ["attendance", companyId, "list", filters ?? {}] as const,
    dashboard: (companyId: string, date?: string, branchId?: string) =>
      ["attendance", companyId, "dashboard", date ?? null, branchId ?? null] as const,
    summary: (
      companyId: string,
      employeeId: string,
      month: number,
      year: number
    ) =>
      ["attendance", companyId, "summary", employeeId, month, year] as const,
    calendar: (
      companyId: string,
      employeeId: string,
      month: number,
      year: number
    ) =>
      ["attendance", companyId, "calendar", employeeId, month, year] as const,
    myCalendar: (companyId: string, month: number, year: number) =>
      ["attendance", companyId, "my-calendar", month, year] as const,
    regularizations: (companyId: string, filters?: RegularizationFilters) =>
      ["attendance", companyId, "regularizations", filters ?? {}] as const,
  },

  // --- Shifts (company-scoped) ---
  shifts: {
    all: (companyId: string) => ["shifts", companyId] as const,
    list: (companyId: string, filters?: ShiftListFilters) =>
      ["shifts", companyId, "list", filters ?? {}] as const,
    detail: (companyId: string, id: string) =>
      ["shifts", companyId, "detail", id] as const,
    history: (companyId: string, employeeId: string) =>
      ["shifts", companyId, "history", employeeId] as const,
    currentReport: (companyId: string, filters?: ShiftReportFilters) =>
      ["shifts", companyId, "current-report", filters ?? {}] as const,
    weeklyOffReport: (companyId: string, filters?: ShiftReportFilters) =>
      ["shifts", companyId, "weekly-off-report", filters ?? {}] as const,
  },

  // --- Holidays (company-scoped) ---
  holidays: {
    all: (companyId: string) => ["holidays", companyId] as const,
    list: (companyId: string, filters?: HolidayListFilters) =>
      ["holidays", companyId, "list", filters ?? {}] as const,
    detail: (companyId: string, id: string) =>
      ["holidays", companyId, "detail", id] as const,
    calendar: (companyId: string, year: number, branchId?: string) =>
      ["holidays", companyId, "calendar", year, branchId ?? null] as const,
  },

  // --- Branches (company-scoped) ---
  branches: {
    all: (companyId: string) => ["branches", companyId] as const,
    list: (companyId: string, branchId?: string) =>
      ["branches", companyId, "list", branchId ?? null] as const,
  },

  // --- Company ---
  company: {
    all: (companyId: string) => ["company", companyId] as const,
    detail: (companyId: string) => ["company", companyId, "detail"] as const,
    staff: (companyId: string) => ["company", companyId, "staff"] as const,
  },

  // --- Current user / sessions ---
  user: {
    me: () => ["user", "me"] as const,
    sessions: () => ["user", "sessions"] as const,
  },

  // --- Company subscription / module access (company-scoped) ---
  subscription: {
    all: (companyId: string) => ["subscription", companyId] as const,
    detail: (companyId: string) => ["subscription", companyId, "detail"] as const,
    invoices: (companyId: string) =>
      ["subscription", companyId, "invoices"] as const,
    access: (companyId: string) => ["subscription", companyId, "access"] as const,
  },
} as const;
