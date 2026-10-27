import { useQuery } from "@tanstack/react-query";
import { getEmployee } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Employee } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// A single employee by id. Gated until both a company and an id are present.
export const useEmployee = (
  id: string | undefined,
  options?: QueryConfig<Employee>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.employees.detail(companyId ?? "", id ?? ""),
    queryFn: async () => {
      const res = await getEmployee(id ?? "", companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!id && (options?.enabled ?? true),
  });
};
