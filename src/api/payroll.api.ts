import api from "./axios";
import type { PayrollUploadType } from "../constants";
import type {
  MessageResponse,
  PayrollRunFilters,
  PayrollRunListResponse,
  PayrollRunResponse,
  PayStatementResponse,
  PayrollEntryResponse,
  PayrollFileKeyResponse,
  PayrollUploadResultResponse,
  RegisterRunPayload,
  UpdateEntryPayload,
  SalaryIncomeFileKeyResponse,
  SalaryImportType,
  SalaryImportFilters,
  ApiEnvelope,
  GratuityRecord,
  ELEncashmentRecord,
  TdsHistoryResponse,
  PreviewPayrollResponse,
  SalaryArrearRecord,
  UploadArrearsResult,
  Form16ResponseDto,
} from "../types";

// Company-scoped: every call carries companyId.
// ✅ upload-file, upload, delete run, edit/delete entry are owner-only.

// --- Upload flow ---
// 1. uploadPayrollFile -> backend PUTs the file to S3 server-side, returns { key }
// 2. registerRun with sourceFileKey = key
//
// The file is sent to OUR backend (multipart), which uploads to S3 in Node. A
// browser cannot PUT directly to a presigned S3 URL without a bucket CORS policy
// (the cross-origin PUT preflight is rejected with 403), so we proxy through the
// backend instead — same approach as employee bulk-upload.
export const uploadPayrollFile = (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<PayrollFileKeyResponse>("/payroll/upload-file", formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Returns a parse summary ({ runId, created, skipped, ... }), not a full run.
export const registerRun = (companyId: string, data: RegisterRunPayload) =>
  api.post<PayrollUploadResultResponse>("/payroll/upload", data, {
    params: { companyId },
  });

// --- runs ---
export const getRuns = (companyId: string, filters?: PayrollRunFilters) =>
  api.get<PayrollRunListResponse>("/payroll/runs", {
    params: { companyId, ...filters },
  });

export const getRun = (companyId: string, runId: string) =>
  api.get<PayrollRunResponse>("/payroll/run", {
    params: { companyId, runId },
  });

export const deleteRun = (companyId: string, runId: string) =>
  api.delete<MessageResponse>("/payroll/run", {
    params: { companyId, runId },
  });

// --- entries ---
export const updateEntry = (
  companyId: string,
  entryId: string,
  data: UpdateEntryPayload
) =>
  api.patch<PayrollEntryResponse>("/payroll/entry", data, {
    params: { companyId, entryId },
  });

export const deleteEntry = (companyId: string, entryId: string) =>
  api.delete<MessageResponse>("/payroll/entry", {
    params: { companyId, entryId },
  });

// --- pay statement (FY, with projection) ---
export const getPayStatement = (
  companyId: string,
  employeeId: string,
  year: number,
  uploadType?: PayrollUploadType
) =>
  api.get<PayStatementResponse>("/payroll/pay-statement", {
    params: { companyId, employeeId, year, uploadType },
  });

export const getSalaryImportHistory = (
  companyId: string,
  type: SalaryImportType,
  filters?: SalaryImportFilters
) => {
  let endpoint = "/payroll/runs";
  if (type === "BONUS") {
    endpoint = "/salary-income/bonus/history";
  } else if (type === "INCENTIVE") {
    endpoint = "/salary-income/incentive/history";
  }

  return api.get<PayrollRunListResponse>(endpoint, {
    params: { companyId, ...filters },
  });
};

export const getSalaryImportDetails = (
  companyId: string,
  type: SalaryImportType,
  runId: string
) => {
  if (type === "SALARY") {
    return api.get<PayrollRunResponse>("/payroll/run", {
      params: { companyId, runId },
    });
  } else if (type === "BONUS") {
    return api.get<PayrollRunResponse>(`/salary-income/bonus/details/${runId}`, {
      params: { companyId },
    });
  } else {
    return api.get<PayrollRunResponse>(`/salary-income/incentive/details/${runId}`, {
      params: { companyId },
    });
  }
};

export const deleteSalaryImport = (
  companyId: string,
  type: SalaryImportType,
  runId: string
) => {
  if (type === "SALARY") {
    return api.delete<MessageResponse>("/payroll/run", {
      params: { companyId, runId },
    });
  } else if (type === "BONUS") {
    return api.delete<MessageResponse>(`/salary-income/bonus/${runId}`, {
      params: { companyId },
    });
  } else {
    return api.delete<MessageResponse>(`/salary-income/incentive/${runId}`, {
      params: { companyId },
    });
  }
};

export const uploadSalaryImportFile = (
  companyId: string,
  type: SalaryImportType,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);

  let endpoint = "/payroll/upload-file";
  if (type === "BONUS") {
    endpoint = "/salary-income/upload-bonus-file";
  } else if (type === "INCENTIVE") {
    endpoint = "/salary-income/upload-incentive-file";
  }

  return api.post<SalaryIncomeFileKeyResponse>(endpoint, formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const registerSalaryImport = (
  companyId: string,
  type: SalaryImportType,
  data: {
    sourceFileKey: string;
    year?: number;
    month?: number;
    fyStartYear?: number;
    uploadType?: string;
    replace?: boolean;
    salaryType?: "REGULAR" | "ARREARS";
  }
) => {
  if (type === "SALARY") {
    return api.post<PayrollUploadResultResponse>("/payroll/upload", data, {
      params: { companyId },
    });
  } else if (type === "BONUS") {
    return api.post<PayrollUploadResultResponse>("/salary-income/upload-bonus", data, {
      params: { companyId },
    });
  } else {
    return api.post<PayrollUploadResultResponse>("/salary-income/upload-incentive", data, {
      params: { companyId },
    });
  }
};

export const downloadSalaryImportTemplate = (
  companyId: string,
  type: SalaryImportType
) => {
  let endpoint = "/payroll/template";
  if (type === "BONUS") {
    endpoint = "/salary-income/template/bonus";
  } else if (type === "INCENTIVE") {
    endpoint = "/salary-income/template/incentive";
  }

  return api.get<Blob>(endpoint, {
    params: { companyId },
    responseType: "blob",
  });
};



// --- Gratuity CRUD APIs ---
export const getGratuityList = (companyId: string, filters?: { employeeId?: string }) =>
  api.get<ApiEnvelope<GratuityRecord[]>>("/salary-income/gratuity", {
    params: { companyId, ...filters },
  });

export const getGratuityDetails = (companyId: string, id: string) =>
  api.get<ApiEnvelope<GratuityRecord>>(`/salary-income/gratuity/${id}`, {
    params: { companyId },
  });

export const createGratuity = (
  companyId: string,
  data: {
    employeeId: string;
    joiningDate: string;
    leavingDate: string;
    lastDrawnSalary: number;
    completedService: number;
    gratuityAmount: number;
    remarks?: string | null;
  }
) =>
  api.post<ApiEnvelope<GratuityRecord>>("/salary-income/gratuity", data, {
    params: { companyId },
  });

export const updateGratuity = (
  companyId: string,
  id: string,
  data: {
    joiningDate?: string;
    leavingDate?: string;
    lastDrawnSalary?: number;
    completedService?: number;
    gratuityAmount?: number;
    remarks?: string | null;
  }
) =>
  api.put<ApiEnvelope<GratuityRecord>>(`/salary-income/gratuity/${id}`, data, {
    params: { companyId },
  });

export const deleteGratuity = (companyId: string, id: string) =>
  api.delete<MessageResponse>(`/salary-income/gratuity/${id}`, {
    params: { companyId },
  });

// --- EL Encashment CRUD APIs ---
export const getELEncashmentList = (
  companyId: string,
  filters?: { employeeId?: string; financialYear?: number }
) =>
  api.get<ApiEnvelope<ELEncashmentRecord[]>>("/salary-income/el-encashment", {
    params: { companyId, ...filters },
  });

export const getELEncashmentDetails = (companyId: string, id: string) =>
  api.get<ApiEnvelope<ELEncashmentRecord>>(`/salary-income/el-encashment/${id}`, {
    params: { companyId },
  });

export const createELEncashment = (
  companyId: string,
  data: {
    employeeId: string;
    financialYear: number;
    leaveDaysEncashed: number;
    averageMonthlySalary?: number;
    yearsOfService: number;
    isGovernmentEmployee?: boolean;
    encashmentAmount: number;
    remarks?: string | null;
  }
) =>
  api.post<ApiEnvelope<ELEncashmentRecord>>("/salary-income/el-encashment", data, {
    params: { companyId },
  });

export const updateELEncashment = (
  companyId: string,
  id: string,
  data: {
    financialYear?: number;
    leaveDaysEncashed?: number;
    averageMonthlySalary?: number;
    yearsOfService?: number;
    isGovernmentEmployee?: boolean;
    encashmentAmount?: number;
    remarks?: string | null;
  }
) =>
  api.put<ApiEnvelope<ELEncashmentRecord>>(`/salary-income/el-encashment/${id}`, data, {
    params: { companyId },
  });

export const deleteELEncashment = (companyId: string, id: string) =>
  api.delete<MessageResponse>(`/salary-income/el-encashment/${id}`, {
    params: { companyId },
  });

export const getEmployeeTdsHistory = (
  companyId: string,
  employeeId: string,
  year: number
) =>
  api.get<TdsHistoryResponse>("/payroll/tds-history", {
    params: { companyId, employeeId, year },
  });

export const previewPayroll = (
  companyId: string,
  sourceFileKey: string
) =>
  api.post<PreviewPayrollResponse>("/payroll/preview", { sourceFileKey }, {
    params: { companyId },
  });

// --- Arrears Salary Upload APIs ---

export const downloadArrearsTemplate = (companyId: string) =>
  api.get<Blob>("/payroll/arrears/template", {
    params: { companyId },
    responseType: "blob",
  });

export const uploadArrearsFile = (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<PayrollFileKeyResponse>("/payroll/arrears/upload-file", formData, {
    params: { companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const registerArrearsUpload = (
  companyId: string,
  data: {
    year: number;
    month: number;
    sourceFileKey: string;
  }
) =>
  api.post<ApiEnvelope<UploadArrearsResult>>("/payroll/arrears/upload", data, {
    params: { companyId },
  });

export const getArrearsList = (
  companyId: string,
  filters?: { year?: number; month?: number }
) =>
  api.get<ApiEnvelope<SalaryArrearRecord[]>>("/payroll/arrears", {
    params: { companyId, ...filters },
  });

export const deleteArrearRecord = (companyId: string, id: string) =>
  api.delete<MessageResponse>(`/payroll/arrears/${id}`, {
    params: { companyId },
  });

export const getForm16 = (
  companyId: string,
  employeeId: string,
  financialYear: string
) =>
  api.get<ApiEnvelope<Form16ResponseDto>>(`/payroll/form16/${employeeId}`, {
    params: { companyId, financialYear },
  });



