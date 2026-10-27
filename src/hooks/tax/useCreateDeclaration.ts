import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeclarationAdmin } from "../../api/tax.api";
import { mapWorkingSheetToDeclaration } from "../../api/tax.mapper";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export interface CreateDeclarationArgs {
  employeeId: string;
  year: number;
}

// Admin opens a declaration on an employee's behalf (owner-only). Moves the
// employee out of the Not Started bucket, so both the list and the summary
// counts change — invalidate the whole `tax.all` prefix.
export const useCreateDeclaration = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<TaxDeclaration, Error, CreateDeclarationArgs>({
    mutationFn: async ({ employeeId, year }) => {
      const cid = requireCompanyId(companyId);
      const res = await createDeclarationAdmin(cid, employeeId, year);
      return mapWorkingSheetToDeclaration(res.data.data);
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    },
  });
};
