import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../../api/department.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Department } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// All departments for the active company. Gated until a company is selected.
export const useDepartments = (
  options?: QueryConfig<Department[]> & {
    branchId?: string;
    departmentId?: string;
  }
) => {
  const companyId = useCompanyId();
  const { branchId, departmentId, ...queryOptions } = options ?? {};

  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.departments.list(companyId ?? "", {
      branchId,
      departmentId,
    }),
    queryFn: async () => {
      const id = companyId ?? "";
      const res = await getDepartments(id, { branchId, departmentId });
      return res.data.data;
    },
    enabled: !!companyId && (queryOptions.enabled ?? true),
  });
};
