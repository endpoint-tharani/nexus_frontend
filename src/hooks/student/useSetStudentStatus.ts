import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStudentStatus } from "../../api/student.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Student, StudentStatus } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

interface SetStudentStatusArgs {
  studentId: string;
  status: StudentStatus;
}

export const useSetStudentStatus = () => {
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  return useMutation<Student, Error, SetStudentStatusArgs>({
    mutationFn: async ({ studentId, status }) => {
      const id = requireCompanyId(companyId);
      const response = await setStudentStatus(id, studentId, status);
      return response.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all(companyId) });
    },
  });
};
