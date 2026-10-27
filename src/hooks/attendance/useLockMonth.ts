import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lockMonth, unlockMonth } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  LockMonthPayload,
  LockMonthResult,
  UnlockMonthResult,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Lock a month (payroll close) — every affected attendance row becomes
// read-only. Refreshes all attendance views so the locked state shows.
export const useLockMonth = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<LockMonthResult, Error, LockMonthPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await lockMonth(id, data);
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

// Reverse a month lock.
export const useUnlockMonth = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<UnlockMonthResult, Error, LockMonthPayload>({
    mutationFn: async (data) => {
      const id = requireCompanyId(companyId);
      const res = await unlockMonth(id, data);
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
