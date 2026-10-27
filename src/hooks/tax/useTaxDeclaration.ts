import { useQuery } from "@tanstack/react-query";
import { getDeclaration } from "../../api/tax.api";
import { mapWorkingSheetToDeclaration } from "../../api/tax.mapper";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxDeclaration } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Admin view: a single declaration (with its proof items) by id.
export const useTaxDeclaration = (
  declarationId: string | undefined,
  options?: QueryConfig<TaxDeclaration>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.tax.declaration(companyId ?? "", declarationId ?? ""),
    queryFn: async () => {
      const res = await getDeclaration(companyId ?? "", declarationId ?? "");
      // The endpoint returns the nested working sheet; flatten it for the UI.
      return mapWorkingSheetToDeclaration(res.data.data);
    },
    enabled: !!companyId && !!declarationId && (options?.enabled ?? true),
  });
};
