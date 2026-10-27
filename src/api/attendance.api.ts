import api from "./axios";
import type {
  AttendanceCalendarResponse,
  AttendanceDashboardParams,
  AttendanceDashboardResponse,
  AttendanceListParams,
  AttendanceListResponse,
  AttendancePeriodParams,
  AttendanceRowResponse,
  AttendanceSummaryResponse,
  BulkMarkPayload,
  BulkMarkResponse,
  LockMonthPayload,
  LockMonthResponse,
  MarkAttendancePayload,
  RegularizationListParams,
  RegularizationListResponse,
  RegularizationResponse,
  RequestRegularizationPayload,
  ReviewRegularizationPayload,
  UnlockMonthResponse,
} from "../types";

// Every attendance route is behind `authorizeCompanyAccess`, which reads the
// active company from the `companyId` query param — so it travels on every call
// (mirrors the employee API), even for the self-service calendar.

// --- Marking ---------------------------------------------------------------
export const markAttendance = (
  companyId: string,
  data: MarkAttendancePayload
) =>
  api.post<AttendanceRowResponse>("/attendance/mark", data, {
    params: { companyId },
  });

export const bulkMarkAttendance = (companyId: string, data: BulkMarkPayload) =>
  api.post<BulkMarkResponse>("/attendance/bulk-mark", data, {
    params: { companyId },
  });

export const uploadAttendance = (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<BulkMarkResponse>("/attendance/upload", formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Reads -----------------------------------------------------------------
export const listAttendance = (
  params: AttendanceListParams & { companyId: string }
) => api.get<AttendanceListResponse>("/attendance/list", { params });

export const getAttendanceSummary = (
  params: AttendancePeriodParams & { companyId: string }
) => api.get<AttendanceSummaryResponse>("/attendance/summary", { params });

export const getAttendanceCalendar = (
  params: AttendancePeriodParams & { companyId: string }
) => api.get<AttendanceCalendarResponse>("/attendance/calendar", { params });

// Self-service: resolves the logged-in user's employee server-side.
export const getMyAttendanceCalendar = (params: {
  companyId: string;
  month: number;
  year: number;
}) => api.get<AttendanceCalendarResponse>("/attendance/my-calendar", { params });

export const getAttendanceDashboard = (
  params: AttendanceDashboardParams & { companyId: string }
) => api.get<AttendanceDashboardResponse>("/attendance/dashboard", { params });

// --- Month lock ------------------------------------------------------------
export const lockMonth = (companyId: string, data: LockMonthPayload) =>
  api.post<LockMonthResponse>("/attendance/lock-month", data, {
    params: { companyId },
  });

export const unlockMonth = (companyId: string, data: LockMonthPayload) =>
  api.post<UnlockMonthResponse>("/attendance/unlock-month", data, {
    params: { companyId },
  });

// --- Regularization workflow ----------------------------------------------
export const requestRegularization = (
  companyId: string,
  data: RequestRegularizationPayload
) =>
  api.post<RegularizationResponse>("/attendance/regularize", data, {
    params: { companyId },
  });

export const reviewRegularization = (
  companyId: string,
  id: string,
  data: ReviewRegularizationPayload
) =>
  api.post<RegularizationResponse>(
    "/attendance/regularizations/review",
    data,
    { params: { companyId, id } }
  );

export const listRegularizations = (
  params: RegularizationListParams & { companyId: string }
) =>
  api.get<RegularizationListResponse>("/attendance/regularizations", {
    params,
  });
