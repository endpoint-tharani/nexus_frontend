import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignShift, bulkAssignShift } from "../../api/shift.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  AssignShiftPayload,
  BulkAssignShiftPayload,
  BulkAssignShiftResult,
  ShiftAssignment,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Assign a shift to one employee (history-preserving; the backend closes the
// previous assignment). Refreshes history + report views via the `all` key.
export const useAssignShift = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<ShiftAssignment, Error, AssignShiftPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await assignShift(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.all(companyId),
      });
    },
  });
};

// Assign one shift to many employees in a single call.
export const useBulkAssignShift = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<BulkAssignShiftResult, Error, BulkAssignShiftPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await bulkAssignShift(id, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.all(companyId),
      });
    },
  });
};
