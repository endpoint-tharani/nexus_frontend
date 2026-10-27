import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDepartment } from "../../api/department.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Department, UpdateDepartmentArgs } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Update a department, then refresh both the list and that department's detail.
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<Department, Error, UpdateDepartmentArgs>({
    mutationFn: async ({ id, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await updateDepartment(id, cid, data);
      return res.data.data;
    },
    onSuccess: (_data, { id }) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.all(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.detail(companyId, id),
      });
    },
  });
};
