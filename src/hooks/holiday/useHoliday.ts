import { useQuery } from "@tanstack/react-query";
import { getHoliday } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Holiday } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// A single holiday by id. Gated until both a company and an id are present.
export const useHoliday = (
  id: string | undefined,
  options?: QueryConfig<Holiday>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.holidays.detail(companyId ?? "", id ?? ""),
    queryFn: async () => {
      const res = await getHoliday(id ?? "", companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!id && (options?.enabled ?? true),
  });
};
