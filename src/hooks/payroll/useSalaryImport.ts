import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSalaryImportHistory,
  deleteSalaryImport,
  uploadSalaryImportFile,
  registerSalaryImport,
} from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  PayrollRun,
  PayrollRunFilters,
  PayrollUploadResult,
  SalaryImportType,
  SalaryImportFilters,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useSalaryImportHistory = (
  type: SalaryImportType,
  filters?: SalaryImportFilters,
  options?: QueryConfig<PayrollRun[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: [...queryKeys.payroll.runs(companyId ?? "", {} as PayrollRunFilters), type, filters],
    queryFn: async () => {
      const res = await getSalaryImportHistory(companyId ?? "", type, filters);
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};

export interface UploadSalaryImportArgs {
  file: File;
  year?: number;
  month?: number;
  fyStartYear?: number;
  uploadType?: string;
  replace?: boolean;
  salaryType?: "REGULAR" | "ARREARS";
}

export const useUploadSalaryImport = (type: SalaryImportType) => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PayrollUploadResult, Error, UploadSalaryImportArgs>({
    mutationFn: async ({ file, year, month, fyStartYear, uploadType, replace, salaryType }) => {
      const cid = requireCompanyId(companyId);

      // 1. upload the file via the backend (server-side S3 PUT) -> { key }
      const fileRes = await uploadSalaryImportFile(cid, type, file);
      const data = fileRes.data.data;

      let sourceFileKey = "";
      if (data.sourceFileKey) {
        sourceFileKey = data.sourceFileKey;
      } else if (data.fileKey) {
        sourceFileKey = data.fileKey;
      } else if (data.key) {
        sourceFileKey = data.key;
      } else {
        throw new Error("No file key returned from upload API");
      }

      // 2. register the run
      const payload =
        type === "SALARY"
          ? { year, month, uploadType, sourceFileKey, replace, salaryType }
          : { fyStartYear, sourceFileKey };

      const res = await registerSalaryImport(cid, type, payload);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.payroll.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTaxStructured.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTax.all(companyId),
      });
    },
  });
};

export const useDeleteSalaryImport = (type: SalaryImportType) => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (runId) => {
      const cid = requireCompanyId(companyId);
      const res = await deleteSalaryImport(cid, type, runId);
      return res.data.data;
    },
    onSuccess: (_data, runId) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.payroll.all(companyId),
      });
      queryClient.removeQueries({
        queryKey: [...queryKeys.payroll.run(companyId, runId)],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTaxStructured.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTax.all(companyId),
      });
    },
  });
};
