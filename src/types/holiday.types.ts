// Domain + payload types for the Holiday Management feature.
//
// Mirrors the live backend contract (PayRoll/src holiday routes, schemas and
// services + the Prisma Holiday model). Dates are date-only ISO strings stored at
// 00:00 UTC. The list endpoint returns `{ items, meta }`; the calendar endpoint
// returns a year grouped by month.

import type { HolidayScope, HolidayType } from "../constants/enums";
import type { ApiEnvelope, BackendPaginated } from "./common.types";

// ---------------------------------------------------------------------------
// Holiday.
// ---------------------------------------------------------------------------
export interface Holiday {
  id: string;
  companyId: string;
  branchId?: string | null;
  name: string;
  date: string; // ISO date (00:00 UTC)
  year: number;
  type: HolidayType;
  scope: HolidayScope;
  isOptional: boolean;
  region?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Query params for GET /holiday/list-holidays. `companyId` is threaded by the hook.
export interface HolidayListParams {
  year?: number;
  month?: number;
  branchId?: string;
  type?: HolidayType;
  search?: string;
  includeInactive?: boolean;
  sortBy?: "date" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export type HolidayListResult = BackendPaginated<Holiday>;

// ---------------------------------------------------------------------------
// Calendar (GET /holiday/calendar).
// ---------------------------------------------------------------------------
export interface HolidayCalendarMonth {
  month: number; // 1..12
  label: string;
  count: number;
  holidays: Holiday[];
}

export interface HolidayCalendarResult {
  year: number;
  total: number;
  months: HolidayCalendarMonth[];
}

export interface HolidayCalendarParams {
  year?: number;
  branchId?: string;
}

// ---------------------------------------------------------------------------
// Create / update payloads (companyId travels as a query param).
// ---------------------------------------------------------------------------
export interface CreateHolidayPayload {
  name: string;
  date: string; // ISO date
  type?: HolidayType;
  scope?: HolidayScope;
  branchId?: string;
  isOptional?: boolean;
  region?: string;
}

export interface UpdateHolidayPayload {
  name?: string;
  date?: string;
  type?: HolidayType;
  scope?: HolidayScope;
  branchId?: string | null;
  isOptional?: boolean;
  region?: string | null;
  isActive?: boolean;
}

export interface UpdateHolidayArgs {
  id: string;
  data: UpdateHolidayPayload;
}

// ---------------------------------------------------------------------------
// Response envelopes.
// ---------------------------------------------------------------------------
export type HolidayResponse = ApiEnvelope<Holiday>;
export type HolidayListResponse = ApiEnvelope<HolidayListResult>;
export type HolidayCalendarResponse = ApiEnvelope<HolidayCalendarResult>;
