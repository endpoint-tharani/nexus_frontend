import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getELEncashmentList,
  getELEncashmentDetails,
  createELEncashment,
  updateELEncashment,
  deleteELEncashment,
} from "../../api/payroll.api";
import { useCompanyId } from "../shared/useCompanyId";
import type { ELEncashmentRecord } from "../../types";
import { queryKeys } from "../../constants/queryKeys";

export const useELEncashmentList = (filters?: { employeeId?: string; financialYear?: number }) => {
  const companyId = useCompanyId();
  return useQuery<ELEncashmentRecord[], Error>({
    queryKey: ["elEncashmentList", companyId, filters],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await getELEncashmentList(companyId, filters);
      return res.data.data;
    },
    enabled: !!companyId,
  });
};

export const useELEncashmentDetails = (id: string | null) => {
  const companyId = useCompanyId();
  return useQuery<ELEncashmentRecord | null, Error>({
    queryKey: ["elEncashmentDetails", companyId, id],
    queryFn: async () => {
      if (!companyId || !id) return null;
      const res = await getELEncashmentDetails(companyId, id);
      return res.data.data;
    },
    enabled: !!companyId && !!id,
  });
};

export const useCreateELEncashment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    ELEncashmentRecord,
    Error,
    {
      employeeId: string;
      financialYear: number;
      leaveDaysEncashed: number;
      averageMonthlySalary?: number;
      yearsOfService: number;
      isGovernmentEmployee?: boolean;
      encashmentAmount: number;
      remarks?: string | null;
    }
  >({
    mutationFn: async (data) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await createELEncashment(companyId, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elEncashmentList"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      }
    },
  });
};

export const useUpdateELEncashment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    ELEncashmentRecord,
    Error,
    {
      id: string;
      financialYear?: number;
      leaveDaysEncashed?: number;
      averageMonthlySalary?: number;
      yearsOfService?: number;
      isGovernmentEmployee?: boolean;
      encashmentAmount?: number;
      remarks?: string | null;
    }
  >({
    mutationFn: async ({ id, ...data }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await updateELEncashment(companyId, id, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elEncashmentList"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      }
    },
  });
};

export const useDeleteELEncashment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await deleteELEncashment(companyId, id);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elEncashmentList"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      }
    },
  });
};
