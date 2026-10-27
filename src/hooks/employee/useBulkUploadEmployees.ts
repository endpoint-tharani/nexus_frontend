import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUploadEmployees } from "../../api/employee.api";
import { queryKeys } from "../../constants/queryKeys";
import type { BulkUploadResult } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

// Bulk-import employees from a CSV/XLSX file. Returns the import summary
// (created + skipped counts, the duplicate codes that were skipped, and any
// parse warnings) and refreshes every employee list for the company.
export const useBulkUploadEmployees = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<BulkUploadResult, Error, File>({
    mutationFn: async (file) => {
      const id = requireCompanyId(companyId);
      const res = await bulkUploadEmployees(id, file);
      return res.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all(companyId),
      });
    },
  });
};
