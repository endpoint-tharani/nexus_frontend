import { useQuery } from "@tanstack/react-query";
import { getCompany } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Company } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

// The active company's full record (incl. role + audit fields). The id is
// resolved from the company store; the query is gated until it is present.
export const useCompany = (options?: QueryConfig<Company>) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.company.detail(companyId ?? ""),
    queryFn: async () => {
      const res = await getCompany(companyId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && (options?.enabled ?? true),
  });
};
