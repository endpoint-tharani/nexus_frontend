import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../../api/department.api";
import { queryKeys } from "../../constants/queryKeys";
import type { CreateDepartmentPayload, Department } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Create a department, then refresh the company's department list.
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Department, Error, CreateDepartmentPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await createDepartment(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.all(companyId),
      });
    },
  });
};
