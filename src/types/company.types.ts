// Domain + payload types for the Company module.
// Mirrors the shape held in `company.store.ts`, extended with audit fields.

import type { CompanyRole } from "../constants/enums";
import type { ApiEnvelope } from "./common.types";

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // ASSUMPTION (Phase 9): these three are NOT confirmed against the live
  // get-company payload. The backend contract text was never provided, and the
  // pre-existing api/store/schema only knew name/email/phone/address. They are
  // added optionally to back the Company Settings form fields the phase brief
  // explicitly asked for. UI degrades gracefully when they are absent.
  website?: string;
  financialYearStartMonth?: number; // 1..12 (matches MONTHS / backend month)
  primaryCountryCode?: string; // ASSUMPTION: ISO-2 country code, e.g. "IN"
  // ASSUMPTION: present on the get-company payload; drives owner-only UI.
  ownerId?: string;
  role?: CompanyRole;
  pan?: string;
  tan?: string;
  // Returned by GET /company/get-company (backend Prisma `include: { users,
  // rootUser }`). `rootUserId` identifies the owner; `users` are every account
  // attached to the company (OWNER/ADMIN/HR staff + login-enabled employees).
  // The team list (TeamManagementCard) is DERIVED from these — there is no
  // separate "list staff" endpoint in the backend.
  rootUserId?: string;
  rootUser?: CompanyUserSummary;
  users?: CompanyUserSummary[];
  // Admin-controlled switch for employee self-service (My Tax + My Pay
  // Statement). When explicitly `false`, the employee pages are locked; an
  // absent value is treated as open (the gate is opt-in until the backend sends
  // it). Toggled from Company Settings; read by `useEmployeeViewLocked`.
  employeeViewEnabled?: boolean;
  // Extended Statutory & Company Master Fields
  displayName?: string;
  code?: string;
  entityType?: "Private Limited" | "Public Limited" | "LLP" | "Partnership" | "Proprietorship" | "Trust" | "Society" | "Government" | "Other";
  dateOfIncorporation?: string;
  deductorType?: "Company" | "Government" | "Others";
  deductorCategory?: string;
  tdsCircle?: string;
  gstin?: string;
  pfRegistrationNo?: string;
  esiRegistrationNo?: string;
  ptRegistrationNo?: string;
  responsiblePerson?: {
    name: string;
    designation: string;
    pan?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: "Active" | "Inactive";
  };
  payrollConfig?: {
    cycle?: string;
    mode?: string;
    salaryImport?: boolean;
    attendanceIntegration?: boolean;
    arrearsSupport?: boolean;
    bonusSupport?: boolean;
    previousEmploymentSupport?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // See ASSUMPTION note on `Company` — sent only when the form provides them.
  website?: string;
  financialYearStartMonth?: number;
  primaryCountryCode?: string;
  pan?: string;
  tan?: string;
}

// All fields optional on update (PATCH semantics). `employeeViewEnabled` is not
// a create field — it's the admin toggle for employee self-service access — so
// it's added here rather than on CreateCompanyPayload.
export type UpdateCompanyPayload = Partial<CreateCompanyPayload> & {
  employeeViewEnabled?: boolean;
};

// Values produced by the company settings form.
export interface CompanyFormValues {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type CompanyResponse = ApiEnvelope<Company>;

// --- Team / staff management ---------------------------------------------
// A user account embedded in the get-company payload (`include: { users,
// rootUser }`). Mirrors the backend User scalar fields we rely on; the role
// arrives as `userRole` (not `role`).
export interface CompanyUserSummary {
  id: string;
  name: string;
  email: string;
  userRole: CompanyRole;
  isEmailVerified?: boolean;
  companyId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// A member of the company team (owner / admin / HR), DERIVED in `useStaff` from
// the company's embedded `users`. NOTE: there is no backend endpoint that lists
// pending (not-yet-accepted) invites, so only accepted accounts appear here.
export interface CompanyStaff {
  id: string;
  name: string;
  email: string;
  role: CompanyRole;
  isOwner: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
}

// Invite a new ADMIN/HR staff member. companyId travels as a query param; the
// backend requires name + email + role (all three).
export interface InviteStaffPayload {
  email: string;
  name: string;
  role: CompanyRole;
}

// The pending invite the backend returns from POST /company/invite-staff.
export interface StaffInviteResult {
  id: string;
  email: string;
  name: string;
  role: CompanyRole;
  expiresAt: string;
}

export type InviteStaffResponse = ApiEnvelope<StaffInviteResult>;
