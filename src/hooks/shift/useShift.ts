import { useQuery } from "@tanstack/react-query";
import { getShift } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Shift } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// A single shift by id. Gated until both a company and an id are present.
export const useShift = (
  id: string | undefined,
  options?: QueryConfig<Shift>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.shifts.detail(companyId ?? "", id ?? ""),
    queryFn: async () => {
      const res = await getShift(id ?? "", companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!id && (options?.enabled ?? true),
  });
};
