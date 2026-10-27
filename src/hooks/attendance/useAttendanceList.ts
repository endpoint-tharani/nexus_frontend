import { useQuery } from "@tanstack/react-query";
import { listAttendance } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { AttendanceListParams, AttendanceListResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Paginated attendance log for the active company. The backend returns
// `{ items, meta }`; filters (employee/status/date-range/page) are part of the
// query key so each combination caches independently.
export const useAttendanceList = (
  filters?: AttendanceListParams,
  options?: QueryConfig<AttendanceListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.attendance.list(companyId ?? "", filters),
    queryFn: async () => {
      const res = await listAttendance({
        ...filters,
        companyId: companyId ?? "",
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
