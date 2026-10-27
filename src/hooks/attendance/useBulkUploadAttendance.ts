import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAttendance } from "../../api/attendance.api";
import { queryKeys } from "../../constants/queryKeys";
import type { BulkMarkResult } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Import attendance from an Excel/CSV file. The backend never throws on a bad
// row — it returns { processed, skipped, errors } so the dialog can surface a
// per-row summary. Refreshes all attendance views on success.
export const useBulkUploadAttendance = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<BulkMarkResult, Error, File>({
    mutationFn: async (file) => {
      const id = requireCompanyId(companyId);
      const res = await uploadAttendance(id, file);
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
