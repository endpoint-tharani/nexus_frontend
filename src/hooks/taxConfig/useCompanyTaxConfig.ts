import { useQuery } from "@tanstack/react-query";
import { getCompanyTaxConfig } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CompanyTaxConfig } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Admin config screen data for the active company + FY: every master section
// with this company's effective overlay, plus the company's custom fields.
export const useCompanyTaxConfig = (
  year: number,
  options?: QueryConfig<CompanyTaxConfig>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.taxConfig.company(companyId ?? "", year),
    queryFn: async () => {
      const res = await getCompanyTaxConfig(companyId ?? "", year);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
