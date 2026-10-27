import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { EmployeeListParams, Employee } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Paginated, filterable employee list for the active company. The backend
// returns a RAW ARRAY (no total wrapper) sorted createdAt DESC; a page is the
// last one when its length is below `limit`. The filters are part of the query
// key, so each (page/search/department/status) combination caches independently.
export const useEmployees = (
  filters?: EmployeeListParams,
  options?: QueryConfig<Employee[]>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.employees.list(companyId ?? "", filters),
    queryFn: async () => {
      const res = await getEmployees({ ...filters, companyId: companyId ?? "" });
      // Tolerate either a raw array (the documented contract) or a
      // `{ items }`-wrapped payload, so the UI never silently renders empty.
      const data = res.data.data as Employee[] | { items?: Employee[] };
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
