import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDepartment } from "../../api/department.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Delete a department (by id), then refresh the list and drop its detail entry.
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, { id: string; branchId: string }>({
    mutationFn: async ({ id, branchId }) => {
      const cid = requireCompanyId(companyId);
      const res = await deleteDepartment(id, cid, branchId);
      return res.data.data;
    },
    onSuccess: (_data, { id }) => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.all(companyId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.departments.detail(companyId, id),
      });
    },
  });
};
