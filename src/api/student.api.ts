import api from "./axios";

export type StudentStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "INACTIVE" | "ARCHIVED" | "REJECTED";
export interface StudentListParams { branchId?: string; departmentId?: string; status?: StudentStatus; search?: string; page?: number; limit?: number }
export interface CreateStudentPayload { name: string; email: string; branchId: string; admissionNumber: string; departmentIds?: string[]; dateOfBirth?: string; phone?: string; address?: string | null; guardianName?: string | null; guardianPhone?: string | null; guardianEmail?: string | null; emergencyContact?: string | null; enrollmentDate?: string }
export interface UpdateStudentPayload { name?: string; admissionNumber?: string; dateOfBirth?: string | null; phone?: string | null; address?: string | null; guardianName?: string | null; guardianPhone?: string | null; guardianEmail?: string | null; emergencyContact?: string | null; enrollmentDate?: string }
export interface AdmissionCodePayload { branchId: string; maxUses?: number; expiresInDays?: number; allowsSelfRegistration?: boolean; requiresApproval?: boolean }
export type StudentSignupPayload = Omit<CreateStudentPayload, "branchId"> & { code: string; password: string };

export interface StudentSelfProfile {
  id: string;
  admissionNumber?: string | null;
  status?: string;
  phone?: string | null;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  emergencyContact?: string | null;
  user?: { id: string; name: string; email: string };
  memberships?: Array<{ id: string; status?: string; department?: { id: string; name: string } }>;
}

export interface StudentActivity {
  id: string;
  type: string;
  description?: string | null;
  occurredAt: string;
}

export const listStudents = (companyId: string, params: StudentListParams = {}) =>
  api.get<{ success: boolean; message: string; data: { items: StudentSelfProfile[]; total: number; page: number; limit: number } }>("/students", { params: { companyId, ...params } });
export const getStudent = (companyId: string, studentId: string) =>
  api.get<{ success: boolean; message: string; data: StudentSelfProfile }>(`/students/${studentId}`, { params: { companyId } });
export const createStudent = (companyId: string, payload: CreateStudentPayload) =>
  api.post(`/students?companyId=${encodeURIComponent(companyId)}`, payload);
export const updateStudent = (companyId: string, studentId: string, payload: UpdateStudentPayload) =>
  api.patch(`/students/${studentId}?companyId=${encodeURIComponent(companyId)}`, payload);
export const setStudentStatus = (companyId: string, studentId: string, status: Exclude<StudentStatus, "PENDING_APPROVAL" | "REJECTED">) =>
  api.patch(`/students/${studentId}/status?companyId=${encodeURIComponent(companyId)}`, { status });
export const approveStudent = (companyId: string, studentId: string) =>
  api.post(`/students/${studentId}/approve?companyId=${encodeURIComponent(companyId)}`);
export const rejectStudent = (companyId: string, studentId: string, reason?: string) =>
  api.post(`/students/${studentId}/reject?companyId=${encodeURIComponent(companyId)}`, { reason });
export const replaceStudentDepartments = (companyId: string, studentId: string, departmentIds: string[]) =>
  api.put(`/students/${studentId}/departments?companyId=${encodeURIComponent(companyId)}`, { departmentIds });
export const addStudentDepartment = (companyId: string, studentId: string, departmentId: string) =>
  api.post(`/students/${studentId}/departments?companyId=${encodeURIComponent(companyId)}`, { departmentId });
export const endStudentDepartment = (companyId: string, studentId: string, departmentId: string) =>
  api.delete(`/students/${studentId}/departments/${departmentId}?companyId=${encodeURIComponent(companyId)}`);
export const assignStudentStaff = (companyId: string, payload: { userId: string; branchId: string; departmentId?: string }) =>
  api.post(`/students/staff-assignments?companyId=${encodeURIComponent(companyId)}`, payload);
export const createAdmissionCode = (companyId: string, payload: AdmissionCodePayload) =>
  api.post<{ success: boolean; message: string; data: { id: string; code: string; expiresAt?: string } }>(`/students/admission-codes?companyId=${encodeURIComponent(companyId)}`, payload);
export const revokeAdmissionCode = (companyId: string, codeId: string) =>
  api.delete(`/students/admission-codes/${codeId}?companyId=${encodeURIComponent(companyId)}`);
export const setStudentSelfRegistration = (companyId: string, enabled: boolean) =>
  api.patch(`/students/self-registration?companyId=${encodeURIComponent(companyId)}`, { enabled });
export const getStudentActivities = (companyId: string, studentId: string, page = 1, limit = 20) =>
  api.get<{ success: boolean; message: string; data: { items: StudentActivity[]; total: number; page: number; limit: number } }>(`/students/${studentId}/activities`, { params: { companyId, page, limit } });
export const studentSignup = (payload: StudentSignupPayload) => api.post<{ success: boolean; message: string; data: StudentSelfProfile }>("/students/signup", payload);

interface PaginatedActivities {
  items: StudentActivity[];
  total: number;
  page: number;
  limit: number;
}

export const getMyStudentProfile = () =>
  api.get<{ success: boolean; message: string; data: StudentSelfProfile }>("/student/me");

export const getMyStudentDepartments = () =>
  api.get<{ success: boolean; message: string; data: StudentSelfProfile["memberships"] }>("/student/me/departments");

export const getMyStudentActivities = (page = 1, limit = 20) =>
  api.get<{ success: boolean; message: string; data: PaginatedActivities }>("/student/me/activities", { params: { page, limit } });

export const updateMyStudentProfile = (data: Pick<StudentSelfProfile, "phone" | "address" | "guardianName" | "guardianPhone" | "guardianEmail" | "emergencyContact">) =>
  api.patch<{ success: boolean; message: string; data: StudentSelfProfile }>("/student/me", data);
