import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShift } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Soft-delete a shift, then refresh every shift view.
export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const cid = requireCompanyId(companyId);
      await deleteShift(id, cid);
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.all(companyId),
      });
    },
  });
};
