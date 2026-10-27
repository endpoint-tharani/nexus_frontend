import { useQuery } from "@tanstack/react-query";
import { getTaxSummary } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxSummary } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Admin dashboard: aggregated declaration counts/amounts for a company + year.
export const useTaxSummary = (
  year: number,
  options?: QueryConfig<TaxSummary>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.tax.summary(companyId ?? "", year),
    queryFn: async () => {
      const res = await getTaxSummary(companyId ?? "", year);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
