import { useQuery } from "@tanstack/react-query";
import { getHolidayCalendar } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import type { HolidayCalendarResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Holiday calendar for a full year, grouped by month. Optionally scoped to a
// branch (which still includes company-wide holidays).
export const useHolidayCalendar = (
  year: number,
  branchId?: string,
  options?: QueryConfig<HolidayCalendarResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.holidays.calendar(companyId ?? "", year, branchId),
    queryFn: async () => {
      const res = await getHolidayCalendar({
        companyId: companyId ?? "",
        year,
        ...(branchId ? { branchId } : {}),
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
