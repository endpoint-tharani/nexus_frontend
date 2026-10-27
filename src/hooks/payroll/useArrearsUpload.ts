import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getArrearsList,
  uploadArrearsFile,
  registerArrearsUpload,
  deleteArrearRecord,
} from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";
import type {
  SalaryArrearRecord,
  UploadArrearsResult,
} from "../../types";

export const useArrearsHistory = (
  filters?: { year?: number; month?: number },
  options?: QueryConfig<SalaryArrearRecord[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: [...queryKeys.payroll.all(companyId ?? ""), "arrears", filters ?? {}],
    queryFn: async () => {
      const res = await getArrearsList(companyId ?? "", filters);
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};

export interface UploadArrearsArgs {
  file: File;
  year: number;
  month: number;
}

export const useUploadArrears = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<UploadArrearsResult, Error, UploadArrearsArgs>({
    mutationFn: async ({ file, year, month }) => {
      const cid = requireCompanyId(companyId);

      // 1. Upload file buffer to S3 proxy -> returns raw S3 key
      const fileRes = await uploadArrearsFile(cid, file);
      const data = fileRes.data.data;

      let sourceFileKey = "";
      if (data.key) {
        sourceFileKey = data.key;
      } else {
        throw new Error("No file key returned from upload API");
      }

      // 2. Register the parsed run
      const res = await registerArrearsUpload(cid, {
        year,
        month,
        sourceFileKey,
      });

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

export const useDeleteArrear = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const cid = requireCompanyId(companyId);
      const res = await deleteArrearRecord(cid, id);
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
