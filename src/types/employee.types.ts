// Domain + payload types for the Employee module.
//
// These mirror the live backend contract (Prisma `Employee` model + the
// employee routes/schemas in PayRoll/src). Verified against source on
// 2026-06-21 — the employee record uses a single `name`, `phoneNumber`,
// `joinDate`, `panNumber`, `aadhaarNo` and derives "login enabled" from
// `userId` (there is no `loginEnabled` flag). The list endpoint returns a
// RAW ARRAY (no pagination wrapper).

import type { EmployeeStatus } from "../constants/enums";
import type { ApiEnvelope } from "./common.types";
import type { Department } from "./department.types";

export interface Employee {
  id: string;
  companyId: string;
  // Identity
  employeeCode: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  // Demographics
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  // Employment
  designation?: string | null;
  departmentId?: string | null;
  // The list + detail endpoints `include: { department: true }`, so the row
  // carries the full department record (absent on a freshly-created employee,
  // whose create response is not joined).
  department?: Department | null;
  branchId?: string | null;
  joinDate?: string | null;
  status: EmployeeStatus;
  // Tax / KYC linkage
  panNumber?: string | null;
  panDocKey?: string | null;
  aadhaarNo?: string | null;
  // Statutory / bank (present on the full record; optional in the UI).
  uanNumber?: string | null;
  pfNumber?: string | null;
  esiNumber?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  // Self-service login. The backend links a `User` when login is enabled and
  // unlinks it (userId = null) when disabled — so login state is `!!userId`.
  userId?: string | null;
  // Audit
  createdAt?: string;
  updatedAt?: string;
}

// Create payload — companyId travels as a query param. `employeeCode` and
// `name` are REQUIRED by the backend; everything else is optional. Dates must
// be full ISO-8601 datetime strings (the backend validates `z.string().datetime()`).
export interface CreateEmployeePayload {
  employeeCode: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  designation?: string;
  departmentId?: string;
  joinDate?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  panNumber?: string;
  aadhaarNo?: string;
}

// Update is PATCH — every field optional.
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

// Query params accepted by GET /employee/get-employees.
export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
}

// Mutation argument bundles (id + data) for the hooks layer.
export interface UpdateEmployeeArgs {
  id: string;
  data: UpdateEmployeePayload;
}

// Argument for the status-change mutation: which employee + the target status.
// The backend reads `status` from the request BODY (DELETE verb).
export interface UpdateEmployeeStatusArgs {
  id: string;
  status: EmployeeStatus;
}

// Values produced by the employee create/edit form.
export interface EmployeeFormValues {
  employeeCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  designation: string;
  departmentId: string;
  joinDate: string;
  panNumber: string;
  aadhaarNo: string;
}

// Result of a bulk CSV/XLSX import. The backend never fails on a bad row — it
// skips duplicate employee codes and reports them back, plus any parse warnings.
export interface BulkUploadResult {
  created: number;
  skipped: number;
  duplicateCodes: string[];
  warnings: string[];
}

// One employee touched by a bulk login enable/disable.
export interface LoginActionEmployee {
  employeeId: string;
  name: string;
  email: string | null;
}

// An employee skipped by a bulk login action, with the reason.
export interface LoginSkippedEmployee extends LoginActionEmployee {
  reason: string;
}

// Summary returned by POST /employee/enable-login-all.
export interface BulkEnableLoginResult {
  totalEmployees: number;
  enabledCount: number;
  skippedCount: number;
  enabled: LoginActionEmployee[];
  skipped: LoginSkippedEmployee[];
}

// Summary returned by POST /employee/disable-login-all.
export interface BulkDisableLoginResult {
  totalEmployees: number;
  disabledCount: number;
  skippedCount: number;
  disabled: LoginActionEmployee[];
  skipped: LoginSkippedEmployee[];
}

export type EmployeeResponse = ApiEnvelope<Employee>;
// The list response is a raw array (no total-count wrapper) — see backend §6.
export type EmployeeListResponse = ApiEnvelope<Employee[]>;
export type BulkUploadResponse = ApiEnvelope<BulkUploadResult>;
export type BulkEnableLoginResponse = ApiEnvelope<BulkEnableLoginResult>;
export type BulkDisableLoginResponse = ApiEnvelope<BulkDisableLoginResult>;
