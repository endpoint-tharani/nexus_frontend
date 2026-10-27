import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStandardDeduction } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { SetStandardDeductionPayload, StandardDeduction } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Upsert the per-company standard deduction override (owner-only), then refresh
// the config + any cached employee declarations (their tax recomputes).
export const useSetStandardDeduction = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<StandardDeduction, Error, SetStandardDeductionPayload>({
    mutationFn: async (data) => {
      const cid = requireCompanyId(companyId);
      const res = await setStandardDeduction(cid, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.taxConfig.all(companyId),
      });
      // Employee declarations use the new amount on their next read.
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTax.all(companyId),
      });
    },
  });
};
