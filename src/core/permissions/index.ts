// Barrel for the module-permission layer.
export {
  hasModuleAccess,
  hasAnyModule,
  hasAllModules,
  resolveEnabledModules,
  useEnabledModules,
  useModuleAccess,
  useHasModule,
  useFeatureFlag,
} from "./useModuleAccess";
export type { ModuleAccess } from "./useModuleAccess";
