import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStudentDepartment } from "../../api/student.api";
import { queryKeys } from "../../constants/queryKeys";
import type { StudentDepartmentMembership } from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

interface AddStudentDepartmentArgs {
  studentId: string;
  departmentId: string;
}

export const useAddStudentDepartment = () => {
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  return useMutation<StudentDepartmentMembership, Error, AddStudentDepartmentArgs>({
    mutationFn: async ({ studentId, departmentId }) => {
      const id = requireCompanyId(companyId);
      const response = await addStudentDepartment(id, studentId, departmentId);
      return response.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all(companyId) });
    },
  });
};
