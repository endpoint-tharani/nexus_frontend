import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enableEmployeeLogin } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Provision a passwordless self-service login for one employee (the backend
// emails them), then refresh lists + that employee's detail so the login state
// (`userId`) updates. The endpoint replies with a message (no payload). The
// caller handles the 409 (already enabled / email taken) and 400 (no email).
export const useEnableLogin = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<void, Error, string>({
    mutationFn: async (employeeId) => {
      const cid = requireCompanyId(companyId);
      await enableEmployeeLogin(employeeId, cid);
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
