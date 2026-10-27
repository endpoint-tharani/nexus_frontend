import { useQuery } from "@tanstack/react-query";
import { getForm16List } from "../../api/form16.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Form16ListFilters, Form16Record } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useForm16List = (
  year: number,
  filters?: Form16ListFilters,
  options?: QueryConfig<Form16Record[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.form16.list(companyId ?? "", year, filters),
    queryFn: async () => {
      const res = await getForm16List(companyId ?? "", year, filters);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
