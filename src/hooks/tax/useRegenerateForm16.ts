import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regenerateForm16 } from "../../api/form16.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Form16Record } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export interface RegenerateForm16Args {
  employeeId: string;
  year: number;
}

export const useRegenerateForm16 = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Form16Record, Error, RegenerateForm16Args>({
    mutationFn: async ({ employeeId, year }) => {
      const cid = requireCompanyId(companyId);
      const res = await regenerateForm16(cid, employeeId, year);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.form16.all(companyId),
      });
    },
  });
};
