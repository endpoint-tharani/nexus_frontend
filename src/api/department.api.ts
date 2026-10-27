import api from "./axios";
import type {
  CreateDepartmentPayload,
  DepartmentListResponse,
  DepartmentResponse,
  MessageResponse,
  UpdateDepartmentPayload,
} from "../types";

// Every department belongs to a branch within its organization.

export const createDepartment = (
  companyId: string,
  data: CreateDepartmentPayload
) =>
  api.post<DepartmentResponse>("/department/create-department", data, {
    params: { companyId, branchId: data.branchId },
  });

export const getDepartments = (
  companyId: string,
  params: { branchId?: string; departmentId?: string } = {}
) =>
  api.get<DepartmentListResponse>("/department/get-departments", {
    params: { companyId, ...params },
  });

export const getDepartmentById = (
  id: string,
  companyId: string,
  branchId?: string
) =>
  api.get<DepartmentResponse>("/department/get-department-by-id", {
    params: { id, companyId, branchId },
  });

export const updateDepartment = (
  id: string,
  companyId: string,
  data: UpdateDepartmentPayload
) =>
  api.patch<DepartmentResponse>("/department/update-department", data, {
    params: { id, companyId, branchId: data.branchId },
  });

export const deleteDepartment = (
  id: string,
  companyId: string,
  branchId: string
) =>
  api.delete<MessageResponse>("/department/delete-department", {
    params: { id, companyId, branchId },
  });
