import type { CompanyRole } from "../../constants/enums";
import { useAuthStore } from "../../store/auth.store";
import { useMe } from "./useMe";

// Resolves the caller's effective company role for the role-based sidebar and
// route guards. Returns the live `/user/me` role, else the persisted store role,
// else `undefined` when the role is genuinely unknown.
//
// `undefined` is meaningful, not an error: the sidebar/guards treat it as
// fail-closed (shared pages only — see `hasAccess`), so an account whose role
// hasn't resolved (or whose backend omitted it) never leaks into role-specific
// pages. Consumers that need a concrete value for display apply their own
// fallback. Backend authorization stays the source of truth.
export const useCurrentRole = (): CompanyRole | undefined => {
  const meRole = useMe().data?.role;
  const storedRole = useAuthStore((s) => s.user?.role);
  return meRole ?? storedRole;
};
