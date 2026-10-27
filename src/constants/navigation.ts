// Single source of truth for the dashboard navigation + role-based access.
//
// Both the sidebar (DashboardLayout) and the route guards (AppRoutes) read from
// this list, so a route can never be visible-but-unreachable or vice-versa.
// `iconKey` is mapped to a concrete icon component in the layout (this module
// stays pure data — no React imports — so guards can import it cheaply).

import { CompanyRole } from "./enums";

export type NavIconKey =
  | "dashboard"
  | "company"
  | "departments"
  | "employees"
  | "attendance"
  | "myAttendance"
  | "payroll"
  | "payStatements"
  | "tax"
  | "taxConfig"
  | "myTax"
  | "myPayStatement"
  | "profile"
  | "sessions";

// "main"    -> rendered in the sidebar navigation list
// "account" -> tucked into the profile menu that opens from the sidebar avatar
export type NavGroup = "main" | "account";

export interface NavItem {
  label: string;
  path: string; // absolute route path
  iconKey: NavIconKey;
  roles: readonly CompanyRole[]; // roles allowed to see + reach this item
  group: NavGroup;
}

const { OWNER, ADMIN, HR, EMPLOYEE } = CompanyRole;
const ALL_ROLES = [OWNER, ADMIN, HR, EMPLOYEE] as const;

// NAV_ITEMS, ROLE_ACCESS, and rolesFor have been removed as navigation is now backend-driven.

// True when `role` may access an item requiring `roles`.
//
// An unknown/unresolved role (`undefined`) is fail-CLOSED: it can reach only
// items open to EVERY role (the shared chrome — Dashboard/Profile/Sessions),
// never an OWNER/ADMIN/HR-only page NOR an EMPLOYEE-only page. This is the key
// guard against a non-employee account (whose `/user/me` omitted `role`) leaking
// into the employee self-service pages. Once the real role resolves, guards and
// the sidebar re-evaluate against it. Backend authorization stays the source of
// truth.
export const hasAccess = (
  roles: readonly CompanyRole[],
  role: CompanyRole | undefined
): boolean =>
  role === undefined
    ? ALL_ROLES.every((r) => roles.includes(r))
    : roles.includes(role);
