import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveDeclaration } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Approve a declaration (owner-only). Changing status affects the declarations
// list (status filter), the summary counts and the declaration detail, so the
// whole `tax.all` prefix is invalidated.
export const useApproveDeclaration = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, string>({
    mutationFn: async (declarationId) => {
      const cid = requireCompanyId(companyId);
      const res = await approveDeclaration(cid, declarationId);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    },
  });
};
