import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectDeclaration } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for rejecting a declaration: which one + the reason shown to the
// employee.
export interface RejectDeclarationArgs {
  declarationId: string;
  reason: string;
}

// Reject a declaration with a reason (owner-only), then refresh the tax caches.
export const useRejectDeclaration = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, RejectDeclarationArgs>({
    mutationFn: async ({ declarationId, reason }) => {
      const cid = requireCompanyId(companyId);
      const res = await rejectDeclaration(cid, declarationId, reason);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    },
  });
};
