import { useQuery } from "@tanstack/react-query";
import { getForm16 } from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Form16ResponseDto } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useForm16 = (
  employeeId: string | undefined,
  financialYear: string | undefined,
  options?: QueryConfig<Form16ResponseDto>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.payroll.form16Detail(
      companyId ?? "",
      employeeId ?? "",
      financialYear ?? ""
    ),
    queryFn: async () => {
      const res = await getForm16(
        companyId ?? "",
        employeeId ?? "",
        financialYear ?? ""
      );
      return res.data.data;
    },
    enabled:
      !!companyId &&
      !!employeeId &&
      !!financialYear &&
      (options?.enabled ?? true),
  });
};
