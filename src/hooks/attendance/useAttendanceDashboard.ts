import { useQuery } from "@tanstack/react-query";
import { getAttendanceDashboard } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { AttendanceDashboard } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Daily company attendance KPIs (headcount marked, present, on leave, absent)
// for a given date. Powers the StatCards on the admin attendance page.
export const useAttendanceDashboard = (
  date?: string,
  branchId?: string,
  options?: QueryConfig<AttendanceDashboard>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.attendance.dashboard(companyId ?? "", date, branchId),
    queryFn: async () => {
      const res = await getAttendanceDashboard({
        companyId: companyId ?? "",
        ...(date ? { date } : {}),
        ...(branchId ? { branchId } : {}),
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
