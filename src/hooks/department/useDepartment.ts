import { useQuery } from "@tanstack/react-query";
import { getDepartmentById } from "../../api/department.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Department } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// A single department by id. Gated until both a company and an id are present.
export const useDepartment = (
  id: string | undefined,
  options?: QueryConfig<Department>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.departments.detail(companyId ?? "", id ?? ""),
    queryFn: async () => {
      const res = await getDepartmentById(id ?? "", companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!id && (options?.enabled ?? true),
  });
};
