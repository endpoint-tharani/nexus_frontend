import { useQuery } from "@tanstack/react-query";
import {
  getCurrentShiftReport,
  getWeeklyOffReport,
} from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  CurrentShiftReportResult,
  ShiftReportParams,
  WeeklyOffReportResult,
} from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Current Shift Report — every employee with an active shift assignment.
export const useCurrentShiftReport = (
  filters?: ShiftReportParams,
  options?: QueryConfig<CurrentShiftReportResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.shifts.currentReport(companyId ?? "", filters),
    queryFn: async () => {
      const res = await getCurrentShiftReport({
        ...filters,
        companyId: companyId ?? "",
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};

// Weekly Off Report — per-employee weekly offs + a per-weekday roll-up.
export const useWeeklyOffReport = (
  filters?: ShiftReportParams,
  options?: QueryConfig<WeeklyOffReportResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.shifts.weeklyOffReport(companyId ?? "", filters),
    queryFn: async () => {
      const res = await getWeeklyOffReport({
        ...filters,
        companyId: companyId ?? "",
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
