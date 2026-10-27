import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHoliday } from "../../api/holiday.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CreateHolidayPayload, Holiday } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Create a holiday, then refresh every holiday view (list + calendar).
export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Holiday, Error, CreateHolidayPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await createHoliday(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.holidays.all(companyId),
      });
    },
  });
};
