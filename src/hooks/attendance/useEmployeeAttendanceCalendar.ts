import { useQuery } from "@tanstack/react-query";
import { getAttendanceCalendar } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { AttendanceCalendarResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

/**
 * Admin monthly attendance calendar (per-day status + monthly summary)
 * for a specific employee.
 */
export const useEmployeeAttendanceCalendar = (
  employeeId: string | undefined,
  month: number,
  year: number,
  options?: QueryConfig<AttendanceCalendarResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.attendance.calendar(
      companyId ?? "",
      employeeId ?? "",
      month,
      year
    ),
    queryFn: async () => {
      const res = await getAttendanceCalendar({
        companyId: companyId ?? "",
        employeeId: employeeId ?? "",
        month,
        year,
      });
      return res.data.data;
    },
    enabled:
      !!companyId &&
      !!employeeId &&
      Number.isFinite(month) &&
      Number.isFinite(year) &&
      (options?.enabled ?? true),
  });
};
