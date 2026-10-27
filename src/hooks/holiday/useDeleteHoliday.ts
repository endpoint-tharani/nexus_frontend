import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHoliday } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Soft-delete a holiday, then refresh every holiday view.
export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const cid = requireCompanyId(companyId);
      await deleteHoliday(id, cid);
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.holidays.all(companyId),
      });
    },
  });
};
