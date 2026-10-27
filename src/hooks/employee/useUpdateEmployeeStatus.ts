import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeStatus } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { UpdateEmployeeStatusArgs } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Set an employee's status (ACTIVE/INACTIVE/RESIGNED/TERMINATED), then refresh
// lists and that employee's detail. The endpoint replies with a message (no
// payload). Status changes move rows in/out of status-filtered lists, so we
// invalidate the whole `employees.all` prefix.
export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<void, Error, UpdateEmployeeStatusArgs>({
    mutationFn: async ({ id, status }) => {
      const cid = requireCompanyId(companyId);
      await updateEmployeeStatus(id, cid, status);
    },
    onSuccess: (_data, { id }) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.detail(companyId, id),
      });
    },
  });
};
