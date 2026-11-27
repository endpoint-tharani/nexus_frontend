import type { ApiEnvelope } from "./common.types";

export type StudentStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "INACTIVE"
  | "ARCHIVED"
  | "REJECTED";

export interface StudentDepartmentMembership {
  id: string;
  departmentId: string;
  status: "ACTIVE" | "ENDED";
  joinedAt?: string;
  department: {
    id: string;
    name: string;
  };
}

export interface Student {
  id: string;
  userId: string;
  companyId: string;
  branchId: string;
  admissionNumber: string;
  status: StudentStatus;
  dateOfBirth?: string | null;
  phone?: string | null;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  emergencyContact?: string | null;
  enrollmentDate?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  memberships: StudentDepartmentMembership[];
}

export interface StudentListParams {
  branchId?: string;
  departmentId?: string;
  status?: StudentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StudentListResult {
  items: Student[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  branchId: string;
  admissionNumber: string;
  departmentIds: string[];
  dateOfBirth?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  enrollmentDate?: string;
}

export type StudentListResponse = ApiEnvelope<StudentListResult>;
export type StudentResponse = ApiEnvelope<Student>;
export type StudentStatusResponse = ApiEnvelope<Student>;
export type StudentDepartmentResponse = ApiEnvelope<StudentDepartmentMembership>;
