import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CreateEmployeePayload, Employee } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Create an employee, then refresh every employee list (any filter/page) for
// the company via the `employees.all` prefix key.
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Employee, Error, CreateEmployeePayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await createEmployee(id, data);
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
