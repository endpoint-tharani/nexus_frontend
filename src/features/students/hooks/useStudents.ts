import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getStudents } from "../api/student.api";
import { queryKeys } from "../../../constants/queryKeys";
import type { StudentListParams, StudentListResult } from "../../../types";
import { useCompanyId } from "../../../hooks/shared/useCompanyId";
import type { QueryConfig } from "../../../hooks/shared/types";

export const useStudents = (
  filters: StudentListParams = {},
  options?: QueryConfig<StudentListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    retry: (failureCount, error) => {
      const status = (error as AxiosError).response?.status;
      return failureCount < 1 && (status === undefined || status >= 500);
    },
    queryKey: queryKeys.students.list(companyId ?? "", filters),
    queryFn: async () => {
      const response = await getStudents(companyId ?? "", filters);
      return response.data.data;
    },
    enabled: Boolean(companyId) && (options?.enabled ?? true),
  });
};
