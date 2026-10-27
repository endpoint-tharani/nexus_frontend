import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShift } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CreateShiftPayload, Shift } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Create a shift, then refresh every shift view via the `all` prefix key.
export const useCreateShift = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Shift, Error, CreateShiftPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await createShift(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.all(companyId),
      });
    },
  });
};
