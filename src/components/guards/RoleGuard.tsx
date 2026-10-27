import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { CompanyRole } from "../../constants/enums";
import { useRouteAllowed } from "../../core/navigation/useNavigation";

export interface RoleGuardProps {
  roles?: readonly CompanyRole[];
  children: ReactNode;
  /** Where to send a disallowed role (default: the dashboard home). */
  redirectTo?: string;
}

/**
 * Role-based route guard. Uses the backend-driven single source of truth
 * by checking if the active route is present in the permitted navigation payload.
 */
export default function RoleGuard({
  children,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const isAllowed = useRouteAllowed();
  const allowed = isAllowed(window.location.pathname);

  return allowed ? (
    <>{children}</>
  ) : (
    <Navigate to={redirectTo} replace />
  );
}
