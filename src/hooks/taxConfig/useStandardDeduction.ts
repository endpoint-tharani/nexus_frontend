import { useQuery } from "@tanstack/react-query";
import { getStandardDeduction } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { StandardDeduction } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

/** Statutory defaults per Indian Income Tax Act */
const STANDARD_DEDUCTION_DEFAULTS: StandardDeduction = {
  oldRegime: 50_000,
  newRegime: 75_000,
};

// The effective standard deduction for the company + FY: the per-company
// override if one is set, else the global statutory amount per regime.
// Falls back to statutory defaults when the API endpoint is unavailable.
export const useStandardDeduction = (
  year: number,
  options?: QueryConfig<StandardDeduction>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.taxConfig.standardDeduction(companyId ?? "", year),
    queryFn: async () => {
      try {
        const res = await getStandardDeduction(companyId ?? "", year);
        return res.data.data;
      } catch {
        // Endpoint may not exist yet — return statutory defaults so the UI
        // remains functional and the admin can still override later.
        return STANDARD_DEDUCTION_DEFAULTS;
      }
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
    // Show defaults immediately while fetching
    placeholderData: STANDARD_DEDUCTION_DEFAULTS,
    // Don't retry excessively if the endpoint doesn't exist
    retry: 1,
  });
};

export { STANDARD_DEDUCTION_DEFAULTS };
