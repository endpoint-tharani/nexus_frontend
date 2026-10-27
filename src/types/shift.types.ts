// Domain + payload types for the Shift Management feature.
//
// Mirrors the live backend contract (PayRoll/src shift routes, schemas and
// services + the Prisma Shift / EmployeeShiftAssignment models). Times are stored
// as "minutes from local midnight" (startTimeMin / endTimeMin); the UI converts
// to/from "HH:mm". The list endpoint returns `{ items, meta }`.

import type { ShiftType } from "../constants/enums";
import type { ApiEnvelope, BackendPaginated } from "./common.types";

// ---------------------------------------------------------------------------
// Shift (a working-time template).
// ---------------------------------------------------------------------------
export interface Shift {
  id: string;
  companyId: string;
  branchId?: string | null;
  name: string;
  code: string;
  type: ShiftType;
  // Minutes from midnight (0..1439). Null for FLEXIBLE shifts.
  startTimeMin?: number | null;
  endTimeMin?: number | null;
  graceMinutes: number;
  breakMinutes: number;
  fullDayMinutes: number;
  halfDayMinutes: number;
  // 7-char Sun..Sat pattern, '1' = weekly off (e.g. "1000000" => Sunday off).
  weeklyOffPattern: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// A compact shift reference as joined onto assignment history rows.
export interface ShiftRef {
  id: string;
  name: string;
  code: string;
  type: ShiftType;
}

// Query params for GET /shift/list-shifts. `companyId` is threaded by the hook.
export interface ShiftListParams {
  branchId?: string;
  type?: ShiftType;
  search?: string;
  includeInactive?: boolean;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export type ShiftListResult = BackendPaginated<Shift>;

// ---------------------------------------------------------------------------
// Create / update payloads (companyId travels as a query param).
// ---------------------------------------------------------------------------
export interface CreateShiftPayload {
  name: string;
  code: string;
  type: ShiftType;
  branchId?: string;
  startTimeMin?: number | null;
  endTimeMin?: number | null;
  graceMinutes?: number;
  breakMinutes?: number;
  fullDayMinutes?: number;
  halfDayMinutes?: number;
  weeklyOffPattern?: string;
}

export interface UpdateShiftPayload {
  name?: string;
  code?: string;
  type?: ShiftType;
  branchId?: string | null;
  startTimeMin?: number | null;
  endTimeMin?: number | null;
  graceMinutes?: number;
  breakMinutes?: number;
  fullDayMinutes?: number;
  halfDayMinutes?: number;
  weeklyOffPattern?: string;
  isActive?: boolean;
}

export interface UpdateShiftArgs {
  id: string;
  data: UpdateShiftPayload;
}

// ---------------------------------------------------------------------------
// Assignment (employee → shift, history-preserving).
// ---------------------------------------------------------------------------
export interface ShiftAssignment {
  id: string;
  companyId: string;
  employeeId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  assignedById?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined on history / current lookups.
  shift?: ShiftRef | Shift | null;
}

export interface AssignShiftPayload {
  employeeId: string;
  shiftId: string;
  effectiveFrom: string; // ISO date
  note?: string;
}

export interface BulkAssignShiftPayload {
  employeeIds: string[];
  shiftId: string;
  effectiveFrom: string; // ISO date
  note?: string;
}

export interface BulkAssignShiftResult {
  assigned: number;
}

// GET /shift/shift-history — the active assignment + full change history.
export interface ShiftHistoryResult {
  active: ShiftAssignment | null;
  history: ShiftAssignment[];
}

// ---------------------------------------------------------------------------
// Reports.
// ---------------------------------------------------------------------------
export interface ShiftReportParams {
  branchId?: string;
  shiftId?: string;
  search?: string;
}

export interface CurrentShiftReportRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string | null;
  branchId: string | null;
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  shiftType: string;
  startTimeMin: number | null;
  endTimeMin: number | null;
  weeklyOffPattern: string;
  weeklyOffDays: string[];
  effectiveFrom: string;
}

export interface CurrentShiftReportResult {
  total: number;
  rows: CurrentShiftReportRow[];
}

export interface WeeklyOffReportRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string | null;
  branchId: string | null;
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  weeklyOffPattern: string;
  weeklyOffDays: string[];
}

export interface WeeklyOffByWeekday {
  index: number;
  day: string;
  employeeCount: number;
}

export interface WeeklyOffReportResult {
  total: number;
  rows: WeeklyOffReportRow[];
  byWeekday: WeeklyOffByWeekday[];
}

// ---------------------------------------------------------------------------
// Response envelopes.
// ---------------------------------------------------------------------------
export type ShiftResponse = ApiEnvelope<Shift>;
export type ShiftListResponse = ApiEnvelope<ShiftListResult>;
export type ShiftAssignmentResponse = ApiEnvelope<ShiftAssignment>;
export type BulkAssignShiftResponse = ApiEnvelope<BulkAssignShiftResult>;
export type ShiftHistoryResponse = ApiEnvelope<ShiftHistoryResult>;
export type CurrentShiftReportResponse = ApiEnvelope<CurrentShiftReportResult>;
export type WeeklyOffReportResponse = ApiEnvelope<WeeklyOffReportResult>;
