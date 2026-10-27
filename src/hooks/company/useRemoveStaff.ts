import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeStaff } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Remove a staff member (ADMIN / HR) from the active company. Owner-only on the
// backend (verifyCompanyRootAccess). The team list is DERIVED from the company
// record, so a successful removal just refreshes that query and the member drops
// off the list — there is no separate staff cache to update.
//
// Mutation argument is the staff member's `userId` (CompanyStaff.id).
export const useRemoveStaff = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, string>({
    mutationFn: async (userId) => {
      const cid = requireCompanyId(companyId);
      const res = await removeStaff(cid, userId);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.all(companyId),
      });
    },
  });
};
