import { useQuery } from "@tanstack/react-query";
import { getForm16Summary } from "../../api/form16.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Form16Summary } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useForm16Summary = (
  year: number,
  options?: QueryConfig<Form16Summary>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.form16.summary(companyId ?? "", year),
    queryFn: async () => {
      const res = await getForm16Summary(companyId ?? "", year);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
