import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { ProductModule } from "../../constants/modules";
import { useRouteAllowed } from "../../core/navigation/useNavigation";
import AccessDenied from "./AccessDenied";

export interface ModuleGuardProps {
  /** The module required to view the children. */
  module: ProductModule;
  /**
   * What to do when the module is disabled:
   *  - "deny"     → render a 403 Access Denied surface (default)
   *  - "redirect" → bounce to the dashboard
   *  - "hide"     → render nothing (use for inline UI gating)
   */
  fallback?: "deny" | "redirect" | "hide";
  /** Custom node to render instead of the default fallback. */
  fallbackElement?: ReactNode;
  children: ReactNode;
}

/**
 * Module route gate. Uses the backend-driven single source of truth
 * by checking if the active route is present in the permitted navigation payload.
 */
export default function ModuleGuard({
  module,
  fallback = "deny",
  fallbackElement,
  children,
}: ModuleGuardProps) {
  const isAllowed = useRouteAllowed();
  const allowed = isAllowed(window.location.pathname);

  if (allowed) return <>{children}</>;
  if (fallbackElement) return <>{fallbackElement}</>;
  if (fallback === "hide") return null;
  if (fallback === "redirect") return <Navigate to="/dashboard" replace />;
  return <AccessDenied module={module} />;
}
