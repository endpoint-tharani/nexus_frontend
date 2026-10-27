import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestRegularization } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  RegularizationRow,
  RequestRegularizationPayload,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Submit an attendance-correction request. When `employeeId` is omitted the
// backend resolves it from the logged-in user (self-service).
export const useRequestRegularization = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<RegularizationRow, Error, RequestRegularizationPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await requestRegularization(id, data);
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
