// =============================================================================
// MODULE REGISTRY — the single source of truth that the shell is generated from.
//
// The sidebar, router and dashboard read EXCLUSIVELY from here, filtered by
// (enabled modules ∩ role). Adding a feature = adding a module definition; no
// edits to the layout, routes or dashboard are required. Buying a module at
// runtime makes its nav, routes and widgets appear with no code change / redeploy.
// =============================================================================

import type { CompanyRole } from "../constants/enums";
import { hasAccess } from "../constants/navigation";
import {
  ProductModule,
  orderModules,
} from "../constants/modules";
import type {
  ModuleDefinition,
  ModuleMenuItem,
  ModuleNavSection,
  ModuleWidgetDef,
  ResolvedRoute,
} from "./types";

import { coreModule } from "./core/module";

export const MODULE_REGISTRY: Partial<Record<ProductModule, ModuleDefinition>> = {
  [ProductModule.CORE]: coreModule,
};

export const getModuleDefinition = (
  module: ProductModule
): ModuleDefinition | undefined => MODULE_REGISTRY[module];

// Definitions for an enabled-module set, in canonical render order.
const definitionsFor = (
  enabled: readonly ProductModule[]
): ModuleDefinition[] =>
  orderModules(enabled)
    .map((m) => MODULE_REGISTRY[m])
    .filter((d): d is ModuleDefinition => Boolean(d));

// --- sidebar ----------------------------------------------------------------
// Main sidebar sections: module groups whose items the role may see. Empty
// sections (every item role-filtered out) are dropped.
export const getSidebarSections = (
  enabled: readonly ProductModule[],
  role: CompanyRole | undefined
): ModuleNavSection[] =>
  definitionsFor(enabled)
    .flatMap((def) => def.nav ?? [])
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasAccess(item.roles, role)),
    }))
    .filter((section) => section.items.length > 0);

// Account/profile-menu items (workspace settings) the role may see.
export const getAccountItems = (
  enabled: readonly ProductModule[],
  role: CompanyRole | undefined
): ModuleMenuItem[] =>
  definitionsFor(enabled)
    .flatMap((def) => def.accountNav ?? [])
    .filter((item) => hasAccess(item.roles, role));

// --- routes -----------------------------------------------------------------
// Every routed page contributed by the enabled modules, tagged with its module.
export const getModuleRoutes = (
  enabled: readonly ProductModule[]
): ResolvedRoute[] =>
  definitionsFor(enabled).flatMap((def) =>
    (def.routes ?? []).map((route) => ({ ...route, module: def.module }))
  );

// --- dashboard --------------------------------------------------------------
// Widgets contributed by the enabled modules the role may see, sorted by `order`.
export const getDashboardWidgets = (
  enabled: readonly ProductModule[],
  role: CompanyRole | undefined
): ModuleWidgetDef[] =>
  definitionsFor(enabled)
    .flatMap((def) => def.widgets ?? [])
    .filter((widget) => hasAccess(widget.roles, role))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// --- topbar title -----------------------------------------------------------
// Resolve the active page label from the enabled nav (main + account) by the
// best (longest) path match. Falls back to "Dashboard".
export const resolvePageTitle = (
  pathname: string,
  enabled: readonly ProductModule[],
  role: CompanyRole | undefined
): string => {
  const items: ModuleMenuItem[] = [
    ...getSidebarSections(enabled, role).flatMap((s) => s.items),
    ...getAccountItems(enabled, role),
  ];
  let best: ModuleMenuItem | undefined;
  for (const item of items) {
    const matches =
      item.path === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.path || pathname.startsWith(item.path + "/");
    if (matches && (!best || item.path.length > best.path.length)) best = item;
  }
  return best?.label ?? "Dashboard";
};
