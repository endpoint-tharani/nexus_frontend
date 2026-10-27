import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomField } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CreateCustomFieldPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Create a company-specific custom declaration field (owner-only), then refresh
// the company config.
export const useCreateCustomField = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<unknown, Error, CreateCustomFieldPayload>({
    mutationFn: async (data) => {
      const cid = requireCompanyId(companyId);
      const res = await createCustomField(cid, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.taxConfig.all(companyId),
      });
    },
  });
};
