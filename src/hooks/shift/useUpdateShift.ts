import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShift } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Shift, UpdateShiftArgs } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Update a shift, then refresh its list + detail caches.
export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Shift, Error, UpdateShiftArgs>({
    mutationFn: async ({ id, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateShift(id, cid, data);
      return res.data.data;
    },
    onSuccess: (_data, { id }) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.detail(companyId, id),
      });
    },
  });
};
