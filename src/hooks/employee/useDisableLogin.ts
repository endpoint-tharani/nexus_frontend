import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableEmployeeLogin } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Revoke one employee's self-service login (revokes their sessions + unlinks
// the account), then refresh lists + that employee's detail so the login state
// (`userId`) updates. The endpoint replies with a message (no payload). The
// caller handles the 400 (no login to disable).
export const useDisableLogin = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<void, Error, string>({
    mutationFn: async (employeeId) => {
      const cid = requireCompanyId(companyId);
      await disableEmployeeLogin(employeeId, cid);
    },
    onSuccess: (_data, employeeId) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.detail(companyId, employeeId),
      });
    },
  });
};
