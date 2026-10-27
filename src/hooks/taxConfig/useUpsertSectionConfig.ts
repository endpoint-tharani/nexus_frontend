import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertSectionConfig } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { UpsertSectionConfigPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Enable/disable/relabel/cap a master section for the company + FY (owner-only),
// then refresh the company config.
export const useUpsertSectionConfig = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<unknown, Error, UpsertSectionConfigPayload>({
    mutationFn: async (data) => {
      const cid = requireCompanyId(companyId);
      const res = await upsertSectionConfig(cid, data);
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
