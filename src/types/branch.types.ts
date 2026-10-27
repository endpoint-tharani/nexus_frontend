// Domain + payload types for Branches.
//
// Mirrors the backend Prisma `Branch` model and the /branch routes. Branches are
// company-scoped and consumed here mainly to populate Shift / Holiday branch
// pickers and filters. The list endpoint returns `{ items, meta }`.

import type { ApiEnvelope, BackendPaginated } from "./common.types";

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Query params for GET /branch/list-branches. `companyId` is threaded by the hook.
export interface BranchListParams {
  search?: string;
  branchId?: string;
  includeInactive?: boolean;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface BranchPayload {
  name: string;
  code: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

export type BranchListResult = BackendPaginated<Branch>;

export type BranchResponse = ApiEnvelope<Branch>;
export type BranchListResponse = ApiEnvelope<BranchListResult>;
