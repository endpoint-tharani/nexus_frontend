import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAttendance } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { AttendanceRow, MarkAttendancePayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Mark (upsert) one employee-day, then refresh every attendance view
// (log/dashboard/summary/calendar) for the company via the `all` prefix key.
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<AttendanceRow, Error, MarkAttendancePayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await markAttendance(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all(companyId),
      });
    },
  });
};
