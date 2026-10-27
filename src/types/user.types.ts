// Domain + payload types for the User / account module
// (profile, change password, active sessions).

import type { CompanyRole } from "../constants/enums";
import type { ProductModule } from "../constants/modules";
import type { ApiEnvelope } from "./common.types";

// The company membership summary the `/user/me` payload is assumed to carry, so
// the app can resolve the active company + the caller's role for the role-based
// sidebar without a separate "list my companies" endpoint (none exists).
export interface UserCompany {
  id: string;
  name: string;
  // Admin toggle for employee self-service (My Tax + My Pay Statement). Carried
  // on the `/user/me` company summary so an employee's session knows whether
  // their self-service pages are open. Absent = open (gate is opt-in).
  employeeViewEnabled?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt?: string;
  // The backend (`/user/me`, login, OTP) returns the caller's role as `userRole`
  // and their company as a bare `companyId` string — there is no joined company
  // object. `useMe` normalizes `userRole` → `role`; the dashboard shell seeds the
  // active company from `companyId` (there is no "get my company" endpoint).
  userRole?: CompanyRole;
  companyId?: string | null;
  // Normalized for the UI: `role` mirrors `userRole`; `company` is the seeded
  // active-company summary. Both optional — guards/sidebar degrade gracefully
  // when absent. Backend authorization remains the source of truth.
  role?: CompanyRole;
  company?: UserCompany;
  branchId?: string | null;
  departmentId?: string | null;
  // The product modules enabled for the caller's company. When the backend
  // includes it (on login / `/user/me`), it seeds the module store and drives the
  // dynamic sidebar/routes/dashboard. Absent → the app falls back to all modules.
  enabledModules?: ProductModule[];
}

export interface UpdateProfilePayload {
  name?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// An active login session as returned by /user/get-active-sessions.
// ASSUMPTION on field names; `current` flags the in-use session.
export interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  lastActiveAt?: string;
  createdAt?: string;
  current?: boolean;
}

// Form value shapes.
export interface ProfileFormValues {
  name: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type UserResponse = ApiEnvelope<User>;
export type SessionListResponse = ApiEnvelope<Session[]>;
