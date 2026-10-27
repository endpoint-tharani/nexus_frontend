import { useQuery } from "@tanstack/react-query";
import { getMyStructuredDeclaration } from "../../api/taxStructured.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxRegime } from "../../constants";
import type { EmployeeStructuredDeclaration } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// The full structured declaration view: salary, structured entries and the live
// computed summary (recomputed server-side on every read).
export const useStructuredDeclaration = (
  year: number,
  regime?: TaxRegime,
  options?: QueryConfig<EmployeeStructuredDeclaration>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.myTaxStructured.declaration(companyId ?? "", year, regime),
    queryFn: async () => {
      const res = await getMyStructuredDeclaration(companyId ?? "", year, regime);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
