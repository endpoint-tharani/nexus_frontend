import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployee } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Employee, UpdateEmployeeArgs } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Update an employee, then refresh both the lists and that employee's detail.
// `employees.all` is a prefix of every list AND every detail key, so one
// invalidation covers both.
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Employee, Error, UpdateEmployeeArgs>({
    mutationFn: async ({ id, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateEmployee(id, cid, data);
      return res.data.data;
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
