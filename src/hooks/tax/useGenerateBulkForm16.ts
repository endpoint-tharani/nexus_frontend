import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateBulkForm16 } from "../../api/form16.api";
import { queryKeys } from "../../constants/queryKeys";
import type { MessageResponse } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export const useGenerateBulkForm16 = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<MessageResponse, Error, number>({
    mutationFn: async (year) => {
      const cid = requireCompanyId(companyId);
      const res = await generateBulkForm16(cid, year);
      return res.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.form16.all(companyId),
      });
    },
  });
};
