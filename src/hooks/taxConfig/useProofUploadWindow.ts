import { useQuery } from "@tanstack/react-query";
import { getProofUploadWindow } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import type { ProofUploadWindow } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useProofUploadWindow = (
  year: number,
  options?: QueryConfig<ProofUploadWindow>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.taxConfig.proofUploadWindow(companyId ?? "", year),
    queryFn: async () => {
      const res = await getProofUploadWindow(companyId ?? "", year);
      return res.data.data;
    },
    enabled: !!companyId && Number.isFinite(year) && (options?.enabled ?? true),
  });
};
