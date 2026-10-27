import { useQuery } from "@tanstack/react-query";
import { getDeclarations } from "../../api/tax.api";
import { mapTrackingRowToDeclaration } from "../../api/tax.mapper";
import { queryKeys } from "../../constants/queryKeys";
import type { DeclarationFilters, TaxDeclaration } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Admin view: all employee tax declarations for a company + financial year,
// optionally filtered by status/employee.
export const useTaxDeclarations = (
  year: number,
  filters?: DeclarationFilters,
  options?: QueryConfig<TaxDeclaration[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.tax.declarations(companyId ?? "", year, filters),
    queryFn: async () => {
      const res = await getDeclarations(companyId ?? "", year, filters);
      // The endpoint returns condensed tracking rows; flatten each so the UI
      // gets a real `id`/`year` (drives view/approve/reject/export).
      return res.data.data.map(mapTrackingRowToDeclaration);
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
