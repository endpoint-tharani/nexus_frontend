import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEntry } from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Delete a single payroll entry (by id), then refresh all payroll caches
// (run totals + lists + pay statements all change).
export const useDeletePayrollEntry = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (entryId) => {
      const cid = requireCompanyId(companyId);
      const res = await deleteEntry(cid, entryId);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.payroll.all(companyId),
      });
    },
  });
};
