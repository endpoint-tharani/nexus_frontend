// Domain + payload types for the Departments feature.
// Kept framework-agnostic so they can be shared across api, hooks and UI.

import type { ApiEnvelope } from "./common.types";

export interface Department {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  // ASSUMPTION: optional free-text description. Not confirmed against the live
  // contract (the original schema/API knew only `name`); sent only when filled
  // and degrades to "—" in the UI when absent.
  description?: string;
  createdAt: string;
}

// Payload sent when creating a department.
// companyId travels as a query param, so the body only carries the fields.
export interface CreateDepartmentPayload {
  branchId: string;
  name: string;
  description?: string;
}

// Payload sent when updating a department.
export interface UpdateDepartmentPayload {
  branchId: string;
  name: string;
  description?: string;
}

// Arguments the update mutation needs: which department + the new values.
export interface UpdateDepartmentArgs {
  id: string;
  data: UpdateDepartmentPayload;
}

// Values produced by the department form (create + edit share the same shape).
export interface DepartmentFormValues {
  name: string;
}

export type DepartmentResponse = ApiEnvelope<Department>;
export type DepartmentListResponse = ApiEnvelope<Department[]>;
