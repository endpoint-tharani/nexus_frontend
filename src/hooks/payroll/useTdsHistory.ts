import { useQuery } from "@tanstack/react-query";
import { getEmployeeTdsHistory } from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import type { TdsHistoryRow } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useTdsHistory = (
  employeeId: string | undefined,
  year: number,
  options?: QueryConfig<TdsHistoryRow[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.payroll.tdsHistory(
      companyId ?? "",
      employeeId ?? "",
      year
    ),
    queryFn: async () => {
      const res = await getEmployeeTdsHistory(
        companyId ?? "",
        employeeId ?? "",
        year
      );
      return res.data.data;
    },
    enabled:
      !!companyId &&
      !!employeeId &&
      Number.isFinite(year) &&
      (options?.enabled ?? true),
  });
};
