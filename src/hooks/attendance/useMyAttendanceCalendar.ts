import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceCalendar } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { AttendanceCalendarResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Self-service monthly calendar (per-day status + the monthly summary) for the
// logged-in employee. The backend resolves the employee from the auth token.
export const useMyAttendanceCalendar = (
  month: number,
  year: number,
  options?: QueryConfig<AttendanceCalendarResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.attendance.myCalendar(companyId ?? "", month, year),
    queryFn: async () => {
      const res = await getMyAttendanceCalendar({
        companyId: companyId ?? "",
        month,
        year,
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
