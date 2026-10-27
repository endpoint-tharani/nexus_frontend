import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMyProof } from "../../api/meTax.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for removing a proof item (or just its document) from my own
// declaration.
export interface RemoveMyProofArgs {
  declarationId: string;
  itemId: string;
  removeItem?: boolean;
}

// Remove a proof item from my declaration, then refresh the cached declaration.
export const useRemoveMyProof = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, RemoveMyProofArgs>({
    mutationFn: async ({ declarationId, itemId, removeItem }) => {
      const cid = requireCompanyId(companyId);
      const res = await removeMyProof(cid, declarationId, itemId, removeItem);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTax.all(companyId),
      });
    },
  });
};
