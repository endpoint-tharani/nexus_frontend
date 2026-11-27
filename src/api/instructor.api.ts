import api from "./axios";

export type InstructorStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "INACTIVE" | "ARCHIVED" | "REJECTED";
export interface InstructorProfile {
  id: string;
  userId?: string;
  companyId?: string;
  status?: InstructorStatus;
  employeeCode?: string | null;
  phone?: string | null;
  bio?: string | null;
  specializations?: string[];
  qualification?: string | null;
  experienceYears?: number | null;
  joiningDate?: string | null;
  user?: { id: string; name: string; email: string; createdAt?: string };
}
export interface InstructorListParams { search?: string; status?: InstructorStatus; branchId?: string; departmentId?: string; page?: number; limit?: number }
export interface InstructorUpdatePayload { employeeCode?: string | null; phone?: string | null; bio?: string | null; specializations?: string[]; qualification?: string | null; experienceYears?: number | null; joiningDate?: string | null }
export interface InstructorSelfUpdatePayload extends Omit<InstructorUpdatePayload, "employeeCode" | "joiningDate" | "experienceYears"> {}
export interface InstructorRelation { id: string; branchId?: string; departmentId?: string; status?: string; branch?: { id: string; name: string }; department?: { id: string; name: string }; departments?: Array<{ departmentId: string; status: string }> }

export interface InstructorStudent {
  id: string;
  admissionNumber?: string | null;
  status?: string;
  user?: { id: string; name: string; email?: string | null };
  memberships?: Array<{ department?: { name: string } }>;
}

export interface InstructorStudentPage {
  items: InstructorStudent[];
  total: number;
  page: number;
  limit: number;
}

const instructorRoot = "/instructors";
export const createInstructor = (companyId: string, payload: { name: string; email: string }) => api.post(`${instructorRoot}`, payload, { params: { companyId } });
export const listInstructors = (companyId: string, params: InstructorListParams = {}) =>
  api.get<{ success: boolean; message: string; data: { items: InstructorProfile[]; total: number; page: number; limit: number } }>(instructorRoot, { params: { companyId, ...params } });
export const getInstructor = (companyId: string, instructorId: string) => api.get<{ success: boolean; message: string; data: InstructorProfile }>(`${instructorRoot}/${instructorId}`, { params: { companyId } });
export const updateInstructor = (companyId: string, instructorId: string, payload: InstructorUpdatePayload) => api.patch(`${instructorRoot}/${instructorId}?companyId=${encodeURIComponent(companyId)}`, payload);
export const setInstructorStatus = (companyId: string, instructorId: string, status: Exclude<InstructorStatus, "PENDING_APPROVAL">, reason?: string) => api.patch(`${instructorRoot}/${instructorId}/status?companyId=${encodeURIComponent(companyId)}`, { status, reason });
export const approveInstructor = (companyId: string, instructorId: string) => api.post(`${instructorRoot}/${instructorId}/approve?companyId=${encodeURIComponent(companyId)}`);
export const rejectInstructor = (companyId: string, instructorId: string, reason?: string) => api.post(`${instructorRoot}/${instructorId}/reject?companyId=${encodeURIComponent(companyId)}`, { reason });
export const getInstructorBranches = (companyId: string, instructorId: string) => api.get<{ success: boolean; message: string; data: InstructorRelation[] }>(`${instructorRoot}/${instructorId}/branches`, { params: { companyId } });
export const linkInstructorBranch = (companyId: string, instructorId: string, branchId: string) => api.post(`${instructorRoot}/${instructorId}/branches?companyId=${encodeURIComponent(companyId)}`, { branchId });
export const endInstructorBranch = (companyId: string, instructorId: string, branchId: string) => api.delete(`${instructorRoot}/${instructorId}/branches/${branchId}?companyId=${encodeURIComponent(companyId)}`);
export const getInstructorDepartments = (companyId: string, instructorId: string) => api.get<{ success: boolean; message: string; data: InstructorRelation[] }>(`${instructorRoot}/${instructorId}/departments`, { params: { companyId } });
export const linkInstructorDepartment = (companyId: string, instructorId: string, branchId: string, departmentId: string) => api.post(`${instructorRoot}/${instructorId}/departments?companyId=${encodeURIComponent(companyId)}`, { branchId, departmentId });
export const endInstructorDepartment = (companyId: string, instructorId: string, branchId: string, departmentId: string) => api.delete(`${instructorRoot}/${instructorId}/departments/${departmentId}`, { params: { companyId, branchId } });
export const getMyInstructorProfile = () => api.get<{ success: boolean; message: string; data: InstructorProfile }>("/instructor/me");
export const updateMyInstructorProfile = (payload: InstructorSelfUpdatePayload) => api.patch("/instructor/me", payload);
export const getMyInstructorBranches = () => api.get<{ success: boolean; message: string; data: InstructorRelation[] }>("/instructor/me/branches");
export const getMyInstructorDepartments = () => api.get<{ success: boolean; message: string; data: InstructorRelation[] }>("/instructor/me/departments");
export const getMyInstructorActivities = (page = 1, limit = 20) => api.get<{ success: boolean; message: string; data: { items: InstructorActivity[]; total: number; page: number; limit: number } }>("/instructor/me/activities", { params: { page, limit } });

export const getMyTeachingStudents = (params: {
  branchId?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => api.get<{ success: boolean; message: string; data: InstructorStudentPage }>(
  "/instructor/me/students",
  { params },
);

export interface InstructorActivity { id: string; type: string; description?: string | null; occurredAt: string }
export const getTeachingStudentActivities = (studentId: string, page = 1, limit = 20) =>
  api.get<{ success: boolean; message: string; data: { items: InstructorActivity[]; total: number; page: number; limit: number } }>(`/instructor/me/students/${studentId}/activities`, { params: { page, limit } });
