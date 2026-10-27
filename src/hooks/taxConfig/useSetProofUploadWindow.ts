import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchProofUploadWindow } from "../../api/taxConfig.api";
import { queryKeys } from "../../constants/queryKeys";
import { useCompanyId } from "../shared/useCompanyId";

export const useSetProofUploadWindow = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    { proofUploadOpen: boolean },
    Error,
    { year: number; proofUploadOpen: boolean }
  >({
    mutationFn: async ({ year, proofUploadOpen }) => {
      const res = await patchProofUploadWindow(companyId ?? "", year, proofUploadOpen);
      return res.data.data;
    },
    onSuccess: (_, { year }) => {
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.taxConfig.proofUploadWindow(companyId, year),
        });
      }
    },
  });
};
