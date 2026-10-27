import api from "./axios";
import type {
  PreviousEmploymentListResponse,
  PreviousEmploymentResponse,
  MessageResponse,
} from "../types";

// Employee Self-Service Previous Employment Endpoints
export const getMyPreviousEmployments = (companyId: string, year?: number) =>
  api.get<PreviousEmploymentListResponse>("/me/tax/previous-employment", {
    params: { companyId, financialYearStart: year },
  });

export const createPreviousEmployment = (
  companyId: string,
  data: {
    financialYearStart: number;
    employerName: string;
    employerTan?: string | null;
    employerPan?: string | null;
    employmentFrom: string;
    employmentTo: string;
    grossSalary: number;
    taxableSalary: number;
    professionalTax: number;
    tdsDeducted: number;
    otherIncome: number;
    remarks?: string | null;
    form16Attachment?: string | null;
    salarySlipAttachment?: string | null;
  }
) =>
  api.post<PreviousEmploymentResponse>("/me/tax/previous-employment", data, {
    params: { companyId },
  });

export const updatePreviousEmployment = (
  companyId: string,
  id: string,
  data: {
    financialYearStart?: number;
    employerName?: string;
    employerTan?: string | null;
    employerPan?: string | null;
    employmentFrom?: string;
    employmentTo?: string;
    grossSalary?: number;
    taxableSalary?: number;
    professionalTax?: number;
    tdsDeducted?: number;
    otherIncome?: number;
    remarks?: string | null;
    form16Attachment?: string | null;
    salarySlipAttachment?: string | null;
  }
) =>
  api.put<PreviousEmploymentResponse>(`/me/tax/previous-employment/${id}`, data, {
    params: { companyId },
  });

export const submitPreviousEmployment = (companyId: string, id: string) =>
  api.post<PreviousEmploymentResponse>(`/me/tax/previous-employment/${id}/submit`, {}, {
    params: { companyId },
  });

export const uploadPreviousEmploymentFile = (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<any>("/me/tax/previous-employment/upload-file", formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Admin Previous Employment Endpoints
export const getEmployeePreviousEmployments = (
  companyId: string,
  employeeId: string,
  year?: number
) =>
  api.get<PreviousEmploymentListResponse>(`/tax/previous-employment/${employeeId}`, {
    params: { companyId, financialYearStart: year },
  });

export const listPreviousEmployments = (
  companyId: string,
  filters: { financialYearStart?: number; status?: string; employeeId?: string }
) =>
  api.get<PreviousEmploymentListResponse>("/tax/previous-employment", {
    params: { companyId, ...filters },
  });

export const createPreviousEmploymentAdmin = (
  companyId: string,
  data: {
    employeeId: string;
    financialYearStart: number;
    employerName: string;
    employerTan?: string | null;
    employerPan?: string | null;
    employmentFrom: string;
    employmentTo: string;
    grossSalary: number;
    taxableSalary: number;
    professionalTax: number;
    tdsDeducted: number;
    otherIncome: number;
    remarks?: string | null;
    form16Attachment?: string | null;
    salarySlipAttachment?: string | null;
  }
) =>
  api.post<PreviousEmploymentResponse>("/tax/previous-employment", data, {
    params: { companyId },
  });

export const updatePreviousEmploymentAdmin = (
  companyId: string,
  id: string,
  data: {
    financialYearStart?: number;
    employerName?: string;
    employerTan?: string | null;
    employerPan?: string | null;
    employmentFrom?: string;
    employmentTo?: string;
    grossSalary?: number;
    taxableSalary?: number;
    professionalTax?: number;
    tdsDeducted?: number;
    otherIncome?: number;
    remarks?: string | null;
    form16Attachment?: string | null;
    salarySlipAttachment?: string | null;
    status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  }
) =>
  api.put<PreviousEmploymentResponse>(`/tax/previous-employment/${id}`, data, {
    params: { companyId },
  });

export const approvePreviousEmployment = (companyId: string, id: string) =>
  api.patch<PreviousEmploymentResponse>(`/tax/previous-employment/${id}/approve`, {}, {
    params: { companyId },
  });

export const rejectPreviousEmployment = (
  companyId: string,
  id: string,
  rejectionReason: string
) =>
  api.patch<PreviousEmploymentResponse>(
    `/tax/previous-employment/${id}/reject`,
    { rejectionReason },
    { params: { companyId } }
  );

export const deletePreviousEmploymentAdmin = (companyId: string, id: string) =>
  api.delete<MessageResponse>(`/tax/previous-employment/${id}`, {
    params: { companyId },
  });
