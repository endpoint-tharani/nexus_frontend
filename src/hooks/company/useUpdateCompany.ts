import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompany } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Company, UpdateCompanyPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Update the active company (PATCH semantics), then refresh its cached detail.
// The id is taken from the store, so callers pass only the changed fields.
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Company, Error, UpdateCompanyPayload>({
    mutationFn: async (data) => {
      const cid = requireCompanyId(companyId);
      const res = await updateCompany(cid, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.detail(companyId),
      });
    },
  });
};
