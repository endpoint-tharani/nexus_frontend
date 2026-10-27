import { useQuery } from "@tanstack/react-query";
import { getShiftHistory } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type { ShiftHistoryResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// An employee's active shift + full assignment history (newest first). Gated
// until an employee is selected.
export const useShiftHistory = (
  employeeId: string | undefined,
  options?: QueryConfig<ShiftHistoryResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.shifts.history(companyId ?? "", employeeId ?? ""),
    queryFn: async () => {
      const res = await getShiftHistory(employeeId ?? "", companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!employeeId && (options?.enabled ?? true),
  });
};
