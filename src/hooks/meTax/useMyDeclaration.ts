import { useQuery } from "@tanstack/react-query";
import { getMyDeclaration } from "../../api/meTax.api";
import { mapWorkingSheetToDeclaration } from "../../api/tax.mapper";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxRegime } from "../../constants";
import type { TaxDeclaration } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Self-service: the logged-in employee's own declaration for a financial year.
// The backend resolves the employee from the auth token but still scopes the
// declaration to the active company, so companyId is required (gated via
// `enabled`). Passing `regime` previews the computation under old vs new.
export const useMyDeclaration = (
  year: number,
  regime?: TaxRegime,
  options?: QueryConfig<TaxDeclaration>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.myTax.declaration(companyId ?? "", year, regime),
    queryFn: async () => {
      const res = await getMyDeclaration(companyId ?? "", year, regime);
      // The endpoint returns the nested working sheet; flatten it for the UI.
      return mapWorkingSheetToDeclaration(res.data.data);
    },
    enabled:
      !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
