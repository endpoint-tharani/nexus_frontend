import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableAllEmployeeLogins } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { BulkDisableLoginResult } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Disable login for every employee in the company that currently has one.
// Employees without a login are reported under `skipped`. Refreshes every
// employee list so the login column updates.
export const useDisableAllLogins = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<BulkDisableLoginResult, Error, void>({
    mutationFn: async () => {
      const cid = requireCompanyId(companyId);
      const res = await disableAllEmployeeLogins(cid);
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
