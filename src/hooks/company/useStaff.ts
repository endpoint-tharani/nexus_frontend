import { useMemo } from "react";
import { CompanyRole } from "../../constants/enums";
import type { Company, CompanyStaff, CompanyUserSummary } from "../../types";
import { useCompany } from "./useCompany";

// Roles shown in the team list (login-enabled employees are excluded — this is
// the staff/team view, not the employee directory).
const STAFF_ROLES: readonly CompanyRole[] = [
  CompanyRole.OWNER,
  CompanyRole.ADMIN,
  CompanyRole.HR,
];

const ROLE_RANK: Record<CompanyRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  BRANCH_ADMIN: 2,
  DEPARTMENT_ADMIN: 3,
  HR: 4,
  EMPLOYEE: 5,
  SUPER_ADMIN: 6,
};

const toStaff = (
  user: CompanyUserSummary,
  rootUserId?: string
): CompanyStaff => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.userRole,
  isOwner: user.userRole === CompanyRole.OWNER || user.id === rootUserId,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

// Derives the company's team (owner + admins + HR) from the `users` embedded in
// the get-company payload. The backend has no dedicated staff-list endpoint, so
// this reads through the company query rather than firing its own request.
const deriveStaff = (company?: Company): CompanyStaff[] => {
  if (!company) return [];

  const byId = new Map<string, CompanyStaff>();
  for (const user of company.users ?? []) {
    if (user.deletedAt) continue; // skip soft-deleted accounts
    if (!STAFF_ROLES.includes(user.userRole)) continue;
    byId.set(user.id, toStaff(user, company.rootUserId));
  }

  // Defensively ensure the owner is present even if absent from `users`.
  if (company.rootUser && !byId.has(company.rootUser.id)) {
    byId.set(company.rootUser.id, toStaff(company.rootUser, company.rootUserId));
  }

  return [...byId.values()].sort(
    (a, b) =>
      ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.name.localeCompare(b.name)
  );
};

// The active company's team (owner + admin/HR staff). Backed by the company
// query — no separate fetch — so it shares its cache, loading and error state.
export const useStaff = () => {
  const query = useCompany();
  const staff = useMemo(() => deriveStaff(query.data), [query.data]);

  return {
    data: staff,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
