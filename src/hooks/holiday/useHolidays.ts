import { useQuery } from "@tanstack/react-query";
import { listHolidays } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import type { HolidayListParams, HolidayListResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Paginated, filterable holiday list for the active company. The backend returns
// `{ items, meta }`; filters (year/month/branch/type/search/page) are part of the
// query key so each combination caches independently (server pagination).
export const useHolidays = (
  filters?: HolidayListParams,
  options?: QueryConfig<HolidayListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.holidays.list(companyId ?? "", filters),
    queryFn: async () => {
      const res = await listHolidays({ ...filters, companyId: companyId ?? "" });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
