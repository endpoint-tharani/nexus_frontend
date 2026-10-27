import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHoliday } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Holiday, UpdateHolidayArgs } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Update a holiday, then refresh its list/calendar + detail caches.
export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Holiday, Error, UpdateHolidayArgs>({
    mutationFn: async ({ id, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateHoliday(id, cid, data);
      return res.data.data;
    },
    onSuccess: (_data, { id }) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.holidays.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.holidays.detail(companyId, id),
      });
    },
  });
};
