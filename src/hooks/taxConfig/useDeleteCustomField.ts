import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomField } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Delete a company custom field by id (owner-only), then refresh the config.
export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<unknown, Error, string>({
    mutationFn: async (fieldId) => {
      const cid = requireCompanyId(companyId);
      const res = await deleteCustomField(cid, fieldId);
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
