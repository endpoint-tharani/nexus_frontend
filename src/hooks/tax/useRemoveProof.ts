import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeProof } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for removing a proof item from a declaration (owner-only).
// `removeItem` controls whether the whole item is dropped vs just its proof doc.
export interface RemoveProofArgs {
  declarationId: string;
  itemId: string;
  removeItem?: boolean;
}

// Remove a proof item (or its document) from a declaration, then refresh the
// tax caches.
export const useRemoveProof = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, RemoveProofArgs>({
    mutationFn: async ({ declarationId, itemId, removeItem }) => {
      const cid = requireCompanyId(companyId);
      const res = await removeProof(cid, declarationId, itemId, removeItem);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    },
  });
};
