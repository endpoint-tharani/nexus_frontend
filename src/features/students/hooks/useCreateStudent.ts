import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudent } from "../api/student.api";
import { queryKeys } from "../../../constants/queryKeys";
import type { CreateStudentPayload, Student } from "../../../types";
import { requireCompanyId, useCompanyId } from "../../../hooks/shared/useCompanyId";

export const useCreateStudent = () => {
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  return useMutation<Student, Error, CreateStudentPayload>({
    mutationFn: async (payload) => {
      const id = requireCompanyId(companyId);
      const response = await createStudent(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all(companyId) });
    },
  });
};
