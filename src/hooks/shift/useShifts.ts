import { useQuery } from "@tanstack/react-query";
import { listShifts } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type { ShiftListParams, ShiftListResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// Paginated, filterable shift list for the active company. The backend returns
// `{ items, meta }`; filters (branch/type/search/page) are part of the query key
// so each combination caches independently (true server pagination).
export const useShifts = (
  filters?: ShiftListParams,
  options?: QueryConfig<ShiftListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.shifts.list(companyId ?? "", filters),
    queryFn: async () => {
      const res = await listShifts({ ...filters, companyId: companyId ?? "" });
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
