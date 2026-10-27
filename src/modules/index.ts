// Barrel for the module registry layer.
export {
  MODULE_REGISTRY,
  getModuleDefinition,
  getSidebarSections,
  getAccountItems,
  getModuleRoutes,
  getDashboardWidgets,
  resolvePageTitle,
} from "./moduleRegistry";
export type {
  ModuleDefinition,
  ModuleMenuItem,
  ModuleNavSection,
  ModuleRouteDef,
  ModuleWidgetDef,
  ResolvedRoute,
  RouteComponent,
} from "./types";
