import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGratuityList, getGratuityDetails, createGratuity, updateGratuity, deleteGratuity } from "../../api/payroll.api";
import { useCompanyId } from "../shared/useCompanyId";
import type { GratuityRecord } from "../../types";
import { queryKeys } from "../../constants/queryKeys";

export const useGratuityList = (filters?: { employeeId?: string }) => {
  const companyId = useCompanyId();
  return useQuery<GratuityRecord[], Error>({
    queryKey: ["gratuityList", companyId, filters],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await getGratuityList(companyId, filters);
      return res.data.data;
    },
    enabled: !!companyId,
  });
};

export const useGratuityDetails = (id: string | null) => {
  const companyId = useCompanyId();
  return useQuery<GratuityRecord | null, Error>({
    queryKey: ["gratuityDetails", companyId, id],
    queryFn: async () => {
      if (!companyId || !id) return null;
      const res = await getGratuityDetails(companyId, id);
      return res.data.data;
    },
    enabled: !!companyId && !!id,
  });
};

export const useCreateOrUpdateGratuity = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    GratuityRecord,
    Error,
    {
      id?: string;
      employeeId: string;
      joiningDate: string;
      leavingDate: string;
      lastDrawnSalary: number;
      completedService: number;
      gratuityAmount: number;
      remarks?: string | null;
    }
  >({
    mutationFn: async ({ id, ...data }) => {
      if (!companyId) throw new Error("No active company ID");
      if (id) {
        const res = await updateGratuity(companyId, id, data);
        return res.data.data;
      } else {
        const res = await createGratuity(companyId, data);
        return res.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gratuityList"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      }
    },
  });
};

export const useDeleteGratuity = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await deleteGratuity(companyId, id);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gratuityList"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      }
    },
  });
};
