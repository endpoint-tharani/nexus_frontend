import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewRegularization } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  RegularizationRow,
  ReviewRegularizationArgs,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Approve/reject a regularization. An approval also upserts the underlying
// attendance row server-side, so we invalidate the whole attendance tree.
export const useReviewRegularization = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<RegularizationRow, Error, ReviewRegularizationArgs>({
    mutationFn: async ({ id, data }) => {
      const cid = requireCompanyId(companyId);
      const res = await reviewRegularization(cid, id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all(companyId),
      });
    },
  });
};
