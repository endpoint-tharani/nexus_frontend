import { useQuery } from "@tanstack/react-query";
import { getPayStatement } from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import type { PayrollUploadType } from "../../constants";
import type { PayStatement } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// An employee's financial-year pay statement (actuals + projection), optionally
// narrowed to a single upload type (salary/incentive/other).
export const usePayStatement = (
  employeeId: string | undefined,
  year: number,
  uploadType?: PayrollUploadType,
  options?: QueryConfig<PayStatement>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.payroll.payStatement(
      companyId ?? "",
      employeeId ?? "",
      year,
      uploadType
    ),
    queryFn: async () => {
      const res = await getPayStatement(
        companyId ?? "",
        employeeId ?? "",
        year,
        uploadType
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
