import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../api/student.api";
import { queryKeys } from "../../constants/queryKeys";
import type { StudentListParams, StudentListResult } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";

export const useStudents = (
  filters: StudentListParams = {},
  options?: QueryConfig<StudentListResult>
) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.students.list(companyId ?? "", filters),
    queryFn: async () => {
      const response = await getStudents(companyId ?? "", filters);
      return response.data.data;
    },
    enabled: Boolean(companyId) && (options?.enabled ?? true),
  });
};
