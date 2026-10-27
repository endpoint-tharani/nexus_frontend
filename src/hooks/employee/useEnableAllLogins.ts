import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enableAllEmployeeLogins } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { BulkEnableLoginResult } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Enable passwordless login for every eligible employee in the company at once.
// Never fails on a bad row — ineligible employees (no email, already enabled,
// email already taken) are reported under `skipped`. Refreshes every employee
// list so the login column updates.
export const useEnableAllLogins = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<BulkEnableLoginResult, Error, void>({
    mutationFn: async () => {
      const cid = requireCompanyId(companyId);
      const res = await enableAllEmployeeLogins(cid);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all(companyId),
      });
    },
  });
};
