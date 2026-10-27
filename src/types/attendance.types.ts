// Domain + payload types for the Attendance module.
//
// These mirror the live backend contract (PayRoll/src attendance routes,
// schemas and services + the Prisma Attendance / AttendanceRegularization /
// AttendanceLock models). All money/decimal fields are serialized as numbers.

import type {
  AttendanceSource,
  AttendanceStatus,
  RegularizationAction,
  RegularizationStatus,
} from "../constants/enums";
import type { ApiEnvelope } from "./common.types";

// A minimal employee stub the list/regularization endpoints `include`.
export interface AttendanceEmployeeRef {
  id: string;
  name: string;
  employeeCode: string;
}

// ---------------------------------------------------------------------------
// Attendance row (one employee-day) — returned by mark + list.
// ---------------------------------------------------------------------------
export interface AttendanceRow {
  id: string;
  companyId: string;
  branchId?: string | null;
  employeeId: string;
  date: string; // ISO datetime (00:00 UTC)
  status: AttendanceStatus;
  source: AttendanceSource;
  shiftId?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  workedMinutes: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
  isEarlyExit: boolean;
  dayValue: number; // 1 | 0.5 | 0
  isPaid: boolean;
  leaveRequestId?: string | null;
  isLocked: boolean;
  payrollRunId?: string | null;
  remarks?: string | null;
  markedById?: string | null;
  createdAt: string;
  updatedAt: string;
  // Present on the list endpoint (joined), absent on a bare mark response.
  employee?: AttendanceEmployeeRef | null;
}

// Pagination envelope returned by the attendance list/regularization endpoints.
// NOTE: this differs from the shared `PaginationMeta` — the backend uses
// `pageSize` (not `limit`) and adds `hasNextPage` / `hasPrevPage`.
export interface AttendancePageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AttendanceListResult {
  items: AttendanceRow[];
  meta: AttendancePageMeta;
}

// Query params for GET /attendance/list. `companyId` is threaded by the hook.
export interface AttendanceListParams {
  employeeId?: string;
  branchId?: string;
  status?: AttendanceStatus;
  from?: string; // ISO date
  to?: string; // ISO date
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Mark / bulk-mark payloads.
// ---------------------------------------------------------------------------
// Either `status` OR both `checkIn` and `checkOut` must be supplied.
export interface MarkAttendancePayload {
  employeeId: string;
  date: string; // ISO date/datetime
  status?: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  isPaid?: boolean;
  remarks?: string;
}

export interface BulkMarkRecord {
  employeeId?: string;
  employeeCode?: string;
  date: string;
  status?: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  isPaid?: boolean;
  remarks?: string;
}

export interface BulkMarkPayload {
  records: BulkMarkRecord[];
}

// Summary returned by POST /attendance/bulk-mark and POST /attendance/upload.
export interface BulkMarkError {
  row: number;
  ref?: string;
  message: string;
}

export interface BulkMarkResult {
  processed: number;
  skipped: number;
  errors: BulkMarkError[];
}

// ---------------------------------------------------------------------------
// Monthly summary + employee calendar.
// ---------------------------------------------------------------------------
export interface AttendanceSummary {
  totalDaysInMonth: number;
  totalWorkingDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  holidays: number;
  weeklyOffs: number;
  workFromHomeDays: number;
  onDutyDays: number;
  lateEntries: number;
  earlyExits: number;
  overtimeHours: number;
  lopDays: number;
  payableDays: number;
}

export interface AttendanceSummaryResult {
  employeeId: string;
  month: number;
  year: number;
  markedDays: number;
  summary: AttendanceSummary;
}

export interface AttendanceCalendarDay {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  dayValue: number;
  isPaid: boolean;
  marked: boolean;
}

export interface AttendanceCalendarResult {
  employeeId: string;
  month: number;
  year: number;
  summary: AttendanceSummary;
  days: AttendanceCalendarDay[];
}

// Query params shared by summary / calendar.
export interface AttendancePeriodParams {
  employeeId?: string;
  branchId?: string;
  month: number;
  year: number;
}

// ---------------------------------------------------------------------------
// Daily company dashboard (GET /attendance/dashboard).
// ---------------------------------------------------------------------------
export interface AttendanceDashboard {
  date: string; // YYYY-MM-DD
  branchId: string | null;
  headcountMarked: number;
  present: number;
  onLeave: number;
  absent: number;
  byStatus: Partial<Record<AttendanceStatus, number>>;
}

export interface AttendanceDashboardParams {
  date?: string;
  branchId?: string;
}

// ---------------------------------------------------------------------------
// Month lock / unlock (payroll close).
// ---------------------------------------------------------------------------
export interface LockMonthPayload {
  month: number;
  year: number;
  branchId?: string;
  reason?: string;
}

export interface AttendanceLock {
  id: string;
  companyId: string;
  branchId: string | null;
  month: number;
  year: number;
  status: "OPEN" | "LOCKED";
  lockedById?: string | null;
  lockedAt?: string | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LockMonthResult {
  lockedRows: number;
  lock: AttendanceLock;
}

export interface UnlockMonthResult {
  unlockedRows: number;
  lock: AttendanceLock;
}

// ---------------------------------------------------------------------------
// Regularization workflow.
// ---------------------------------------------------------------------------
export interface RegularizationRow {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceId?: string | null;
  date: string;
  requestedStatus: AttendanceStatus;
  requestedCheckIn?: string | null;
  requestedCheckOut?: string | null;
  reason: string;
  status: RegularizationStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: AttendanceEmployeeRef | null;
}

// POST /attendance/regularize — `employeeId` is optional; when omitted the
// backend resolves it from the logged-in user's linked employee (self-service).
export interface RequestRegularizationPayload {
  employeeId?: string;
  date: string;
  requestedStatus: AttendanceStatus;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
}

// POST /attendance/regularizations/review?id=<id>
export interface ReviewRegularizationPayload {
  action: RegularizationAction;
  note?: string;
}

export interface RegularizationListParams {
  employeeId?: string;
  status?: RegularizationStatus;
  page?: number;
  pageSize?: number;
}

export interface RegularizationListResult {
  items: RegularizationRow[];
  meta: AttendancePageMeta;
}

// Mutation argument bundle for the review hook.
export interface ReviewRegularizationArgs {
  id: string;
  data: ReviewRegularizationPayload;
}

// ---------------------------------------------------------------------------
// Response envelopes.
// ---------------------------------------------------------------------------
export type AttendanceRowResponse = ApiEnvelope<AttendanceRow>;
export type AttendanceListResponse = ApiEnvelope<AttendanceListResult>;
export type BulkMarkResponse = ApiEnvelope<BulkMarkResult>;
export type AttendanceSummaryResponse = ApiEnvelope<AttendanceSummaryResult>;
export type AttendanceCalendarResponse = ApiEnvelope<AttendanceCalendarResult>;
export type AttendanceDashboardResponse = ApiEnvelope<AttendanceDashboard>;
export type LockMonthResponse = ApiEnvelope<LockMonthResult>;
export type UnlockMonthResponse = ApiEnvelope<UnlockMonthResult>;
export type RegularizationResponse = ApiEnvelope<RegularizationRow>;
export type RegularizationListResponse = ApiEnvelope<RegularizationListResult>;
