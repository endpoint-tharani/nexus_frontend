import api from "./axios";
import type {
  CreateHolidayPayload,
  HolidayCalendarParams,
  HolidayCalendarResponse,
  HolidayListParams,
  HolidayListResponse,
  HolidayResponse,
  MessageResponse,
  UpdateHolidayPayload,
} from "../types";

// Every holiday route is behind `authorizeCompanyAccess`, so `companyId` travels
// on every call. Reads are open to any company member (calendar visibility);
// writes are permission-gated server-side.

export const createHoliday = (companyId: string, data: CreateHolidayPayload) =>
  api.post<HolidayResponse>("/holiday/create-holiday", data, {
    params: { companyId },
  });

export const listHolidays = (
  params: HolidayListParams & { companyId: string }
) => api.get<HolidayListResponse>("/holiday/list-holidays", { params });

export const getHoliday = (id: string, companyId: string) =>
  api.get<HolidayResponse>("/holiday/get-holiday-by-id", {
    params: { id, companyId },
  });

export const getHolidayCalendar = (
  params: HolidayCalendarParams & { companyId: string }
) => api.get<HolidayCalendarResponse>("/holiday/calendar", { params });

export const updateHoliday = (
  id: string,
  companyId: string,
  data: UpdateHolidayPayload
) =>
  api.patch<HolidayResponse>("/holiday/update-holiday", data, {
    params: { id, companyId },
  });

export const deleteHoliday = (id: string, companyId: string) =>
  api.delete<MessageResponse>("/holiday/delete-holiday", {
    params: { id, companyId },
  });
