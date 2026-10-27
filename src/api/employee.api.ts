import api from "./axios";
import type { EmployeeStatus } from "../constants/enums";
import type {
  BulkDisableLoginResponse,
  BulkEnableLoginResponse,
  BulkUploadResponse,
  CreateEmployeePayload,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeResponse,
  MessageResponse,
  UpdateEmployeePayload,
} from "../types";

export const createEmployee = (
  companyId: string,
  data: CreateEmployeePayload
) =>
  api.post<EmployeeResponse>("/employee/create-employee", data, {
    params: { companyId },
  });

export const bulkUploadEmployees = (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<BulkUploadResponse>("/employee/bulk-upload", formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET /employee/get-employees — returns a RAW ARRAY (no total-count wrapper).
export const getEmployees = (
  params: EmployeeListParams & { companyId: string }
) => api.get<EmployeeListResponse>("/employee/get-employees", { params });

export const getEmployee = (id: string, companyId: string) =>
  api.get<EmployeeResponse>("/employee/get-employee", {
    params: { id, companyId },
  });

export const updateEmployee = (
  id: string,
  companyId: string,
  data: UpdateEmployeePayload
) =>
  api.patch<EmployeeResponse>("/employee/update-employee", data, {
    params: { id, companyId },
  });

// Status change. The route uses the DELETE verb but the controller reads the
// target `status` from the request BODY (not the query string), and replies
// with a message envelope (no employee payload).
export const updateEmployeeStatus = (
  id: string,
  companyId: string,
  status: EmployeeStatus
) =>
  api.delete<MessageResponse>("/employee/Status-update-employee", {
    params: { id, companyId },
    data: { status },
  });

// Provision a passwordless self-service login for one employee + email them.
// Replies with a message envelope. 404 (not found), 400 (no email on file),
// 409 (already enabled / email already taken).
export const enableEmployeeLogin = (id: string, companyId: string) =>
  api.post<MessageResponse>("/employee/enable-login", {}, {
    params: { id, companyId },
  });

// Revoke one employee's login (revokes sessions + unlinks the account). The
// employee record is untouched and login can be re-enabled later. Replies with
// a message envelope. 404 (not found), 400 (no login to disable).
export const disableEmployeeLogin = (id: string, companyId: string) =>
  api.post<MessageResponse>("/employee/disable-login", {}, {
    params: { id, companyId },
  });

// Enable login for every eligible employee at once. Never fails on a bad row —
// ineligible employees are reported under `skipped`. Returns a summary.
export const enableAllEmployeeLogins = (companyId: string) =>
  api.post<BulkEnableLoginResponse>("/employee/enable-login-all", {}, {
    params: { companyId },
  });

// Disable login for every employee that currently has one. Returns a summary.
export const disableAllEmployeeLogins = (companyId: string) =>
  api.post<BulkDisableLoginResponse>("/employee/disable-login-all", {}, {
    params: { companyId },
  });
