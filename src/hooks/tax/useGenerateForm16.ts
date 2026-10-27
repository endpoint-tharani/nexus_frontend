import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateForm16 } from "../../api/form16.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Form16Record } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export interface GenerateForm16Args {
  employeeId: string;
  year: number;
}

export const useGenerateForm16 = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Form16Record, Error, GenerateForm16Args>({
    mutationFn: async ({ employeeId, year }) => {
      const cid = requireCompanyId(companyId);
      const res = await generateForm16(cid, employeeId, year);
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
