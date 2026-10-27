import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEntry } from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import type { PayrollEntry, UpdateEntryPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Arguments for editing one payroll entry.
export interface UpdatePayrollEntryArgs {
  entryId: string;
  data: UpdateEntryPayload;
}

// Edit a single payroll entry. The change ripples into the run's totals, the
// run lists and any derived pay statements, so the whole `payroll.all` prefix
// is invalidated.
export const useUpdatePayrollEntry = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PayrollEntry, Error, UpdatePayrollEntryArgs>({
    mutationFn: async ({ entryId, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateEntry(cid, entryId, data);
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
