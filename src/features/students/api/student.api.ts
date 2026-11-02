import api from "../../../api/axios";
import type {
  CreateStudentPayload,
  StudentDepartmentResponse,
  StudentListParams,
  StudentListResponse,
  StudentResponse,
  StudentStatus,
  StudentStatusResponse,
} from "../../../types";

export const getStudents = (
  companyId: string,
  params: StudentListParams = {}
) =>
  api.get<StudentListResponse>("/students", {
    params: { companyId, ...params },
  });

export const createStudent = (
  companyId: string,
  data: CreateStudentPayload
) =>
  api.post<StudentResponse>("/students", data, {
    params: { companyId },
  });

export const setStudentStatus = (
  companyId: string,
  studentId: string,
  status: StudentStatus
) =>
  api.patch<StudentStatusResponse>(
    `/students/${studentId}/status`,
    { status },
    { params: { companyId } }
  );

export const addStudentDepartment = (
  companyId: string,
  studentId: string,
  departmentId: string
) =>
  api.post<StudentDepartmentResponse>(
    `/students/${studentId}/departments`,
    { departmentId },
    { params: { companyId } }
  );
