import type { ComponentType } from "react";
import type { IconType } from "react-icons";
import type { CompanyRole } from "../constants/enums";
import type { ProductModule } from "../constants/modules";

// =============================================================================
// MODULE REGISTRY TYPES
//
// Every product module contributes three things to the app, declaratively:
//   • nav      → sidebar groups + items
//   • routes   → routed pages (mounted under /dashboard)
//   • widgets  → dashboard widgets
// The sidebar, router and dashboard are then GENERATED from the registry filtered
// by (enabled modules ∩ role). Nothing is hardcoded in the shell.
// =============================================================================

// A page component — eager or lazily code-split. `React.lazy(...)` results are
// assignable to ComponentType, so this covers both.
export type RouteComponent = ComponentType;

// One clickable sidebar entry.
export interface ModuleMenuItem {
  label: string;
  path: string; // absolute route path, e.g. "/dashboard/payroll"
  icon: IconType;
  roles: readonly CompanyRole[]; // roles allowed to see + reach it
}

// A sidebar group (header + its items). An empty `label` renders the items at the
// top level with no header (used by the CORE "Dashboard" entry).
export interface ModuleNavSection {
  label: string;
  icon?: IconType;
  items: ModuleMenuItem[];
}

// A routed page contributed by a module (relative to /dashboard).
export interface ModuleRouteDef {
  path: string; // relative path, e.g. "payroll" or "payroll/reports"
  component: RouteComponent;
  roles: readonly CompanyRole[];
  index?: boolean; // true → the /dashboard index route (path ignored)
}

// A dashboard widget contributed by a module.
export interface ModuleWidgetDef {
  id: string;
  component: ComponentType;
  roles: readonly CompanyRole[];
  // Responsive column span (MUI Grid v2 `size`). Defaults to a quarter-width KPI.
  span?: { xs?: number; sm?: number; md?: number; lg?: number };
  // Lower numbers sort first within the dashboard grid.
  order?: number;
}

// The full contribution of a single product module.
export interface ModuleDefinition {
  module: ProductModule;
  label: string;
  icon: IconType;
  /** CORE is always-on; everything else is gated by the subscription. */
  core?: boolean;
  // Sidebar "main" sections.
  nav?: ModuleNavSection[];
  // Items tucked into the profile/account menu (workspace settings, etc.).
  accountNav?: ModuleMenuItem[];
  // Routed pages.
  routes?: ModuleRouteDef[];
  // Dashboard widgets.
  widgets?: ModuleWidgetDef[];
}

// A route resolved out of the registry, tagged with its owning module so the
// router can wrap it in the right <ModuleGuard>.
export interface ResolvedRoute extends ModuleRouteDef {
  module: ProductModule;
}
