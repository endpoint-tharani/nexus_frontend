import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertProof } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { ProofPayload, TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for adding/updating a proof item on a declaration (owner-only).
// `data.itemId` present => update an existing item, otherwise add.
export interface UpsertProofArgs {
  declarationId: string;
  data: ProofPayload;
}

// Add or update a proof item on a declaration, then refresh the tax caches
// (totals on the list + the declaration detail change).
export const useUpsertProof = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, UpsertProofArgs>({
    mutationFn: async ({ declarationId, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await upsertProof(cid, declarationId, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    },
  });
};
