import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitMyDeclaration } from "../../api/meTax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Submit my declaration for review (DRAFT -> SUBMITTED) for a given year, then
// refresh the cached declaration.
export const useSubmitDeclaration = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, number>({
    mutationFn: async (year) => {
      const cid = requireCompanyId(companyId);
      const res = await submitMyDeclaration(cid, year);
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
