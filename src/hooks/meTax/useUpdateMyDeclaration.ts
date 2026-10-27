import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyDeclaration } from "../../api/meTax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration, UpdateMyDeclarationPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for editing the logged-in employee's own declaration (e.g.
// switching regime or bulk-editing proof items) for a given year.
export interface UpdateMyDeclarationArgs {
  year: number;
  data: UpdateMyDeclarationPayload;
}

// Update my declaration, then refresh every cached variant (any year/regime)
// under the `me/tax` prefix.
export const useUpdateMyDeclaration = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, UpdateMyDeclarationArgs>({
    mutationFn: async ({ year, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateMyDeclaration(cid, year, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTax.all(companyId),
      });
      // Regime/figures also drive the structured "Salary & Income" tab.
      queryClient.invalidateQueries({
        queryKey: queryKeys.myTaxStructured.all(companyId),
      });
    },
  });
};
