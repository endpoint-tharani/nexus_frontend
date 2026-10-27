import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompany } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Delete the active company, then drop its cached detail entry. Post-delete
// app state (clearing the company store / redirecting) is the caller's job —
// global navigation belongs to the App Shell phase, not this hook.
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, void>({
    mutationFn: async () => {
      const cid = requireCompanyId(companyId);
      const res = await deleteCompany(cid);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.removeQueries({
        queryKey: queryKeys.company.detail(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.me(),
      });
    },
  });
};
