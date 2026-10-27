import { useQuery } from "@tanstack/react-query";
import { listRegularizations } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  RegularizationListParams,
  RegularizationListResult,
} from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Paginated regularization (attendance-correction) requests for the active
// company. Admins list the whole queue; the self-service page filters by the
// employee's own id.
export const useRegularizations = (
  filters?: RegularizationListParams,
  options?: QueryConfig<RegularizationListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.attendance.regularizations(companyId ?? "", filters),
    queryFn: async () => {
      const res = await listRegularizations({
        ...filters,
        companyId: companyId ?? "",
      });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
