import api from "./axios";
import type {
  AssignShiftPayload,
  BulkAssignShiftPayload,
  BulkAssignShiftResponse,
  CreateShiftPayload,
  CurrentShiftReportResponse,
  ShiftAssignmentResponse,
  ShiftHistoryResponse,
  ShiftListParams,
  ShiftListResponse,
  ShiftReportParams,
  ShiftResponse,
  UpdateShiftPayload,
  WeeklyOffReportResponse,
} from "../types";
import type { MessageResponse } from "../types";

// Every shift route is behind `authorizeCompanyAccess`, which reads the active
// company from the `companyId` query param — so it travels on every call.

// --- CRUD ------------------------------------------------------------------
export const createShift = (companyId: string, data: CreateShiftPayload) =>
  api.post<ShiftResponse>("/shift/create-shift", data, {
    params: { companyId },
  });

export const listShifts = (params: ShiftListParams & { companyId: string }) =>
  api.get<ShiftListResponse>("/shift/list-shifts", { params });

export const getShift = (id: string, companyId: string) =>
  api.get<ShiftResponse>("/shift/get-shift-by-id", {
    params: { id, companyId },
  });

export const updateShift = (
  id: string,
  companyId: string,
  data: UpdateShiftPayload
) =>
  api.patch<ShiftResponse>("/shift/update-shift", data, {
    params: { id, companyId },
  });

export const deleteShift = (id: string, companyId: string) =>
  api.delete<MessageResponse>("/shift/delete-shift", {
    params: { id, companyId },
  });

// --- Assignment ------------------------------------------------------------
export const assignShift = (companyId: string, data: AssignShiftPayload) =>
  api.post<ShiftAssignmentResponse>("/shift/assign-shift", data, {
    params: { companyId },
  });

export const bulkAssignShift = (
  companyId: string,
  data: BulkAssignShiftPayload
) =>
  api.post<BulkAssignShiftResponse>("/shift/bulk-assign-shift", data, {
    params: { companyId },
  });

export const getShiftHistory = (employeeId: string, companyId: string) =>
  api.get<ShiftHistoryResponse>("/shift/shift-history", {
    params: { employeeId, companyId },
  });

// --- Reports ---------------------------------------------------------------
export const getCurrentShiftReport = (
  params: ShiftReportParams & { companyId: string }
) =>
  api.get<CurrentShiftReportResponse>("/shift/current-shift-report", {
    params,
  });

export const getWeeklyOffReport = (
  params: ShiftReportParams & { companyId: string }
) => api.get<WeeklyOffReportResponse>("/shift/weekly-off-report", { params });
