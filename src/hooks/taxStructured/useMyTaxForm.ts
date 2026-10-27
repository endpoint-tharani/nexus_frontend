import { useQuery } from "@tanstack/react-query";
import { getMyTaxForm } from "../../api/taxStructured.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TaxRegime } from "../../constants";
import type { TaxFormSchema } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// The dynamic form schema (sections + fields) the employee fills in, gated to
// the requested regime. Sections not allowed under that regime are omitted.
export const useMyTaxForm = (
  year: number,
  regime?: TaxRegime,
  options?: QueryConfig<TaxFormSchema>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.myTaxStructured.form(companyId ?? "", year, regime),
    queryFn: async () => {
      const res = await getMyTaxForm(companyId ?? "", year, regime);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
