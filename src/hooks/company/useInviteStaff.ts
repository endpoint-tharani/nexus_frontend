import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteStaff } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import type { InviteStaffPayload } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Invite a new ADMIN/HR staff member to the active company, then refresh the
// team list so the pending invite appears. Owner-only on the backend.
export const useInviteStaff = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<unknown, Error, InviteStaffPayload>({
    mutationFn: async (data) => {
      const cid = requireCompanyId(companyId);
      const res = await inviteStaff(cid, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      // The team list is derived from the company record, so refresh that. (The
      // invitee only appears once they accept — there is no pending-invite list.)
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.all(companyId),
      });
    },
  });
};
