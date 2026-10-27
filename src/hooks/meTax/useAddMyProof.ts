import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMyProof } from "../../api/meTax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { ProofPayload, TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for adding a proof item to my own declaration.
export interface AddMyProofArgs {
  declarationId: string;
  data: ProofPayload;
}

// Add a proof item to my declaration, then refresh the cached declaration.
export const useAddMyProof = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, AddMyProofArgs>({
    mutationFn: async ({ declarationId, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await addMyProof(cid, declarationId, data);
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
