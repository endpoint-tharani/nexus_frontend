import {
  ModuleStatus,
  ProductModule,
  PURCHASABLE_MODULES,
} from "../../constants/modules";
import type { CompanyModule, CompanySubscription } from "../../types";

// =============================================================================
// FALLBACK + NORMALIZATION
//
// When the subscription endpoint is unavailable (the backend hasn't shipped it),
// we synthesize an honest "default access" record so the whole app — including
// the Subscription UI — stays functional. It is clearly flagged `isFallback`.
// =============================================================================

// Build a CompanyModule[] from a flat enabled-module list (everything else is
// offered as DISABLED so the marketplace can show it).
export const buildModuleList = (
  enabled: readonly ProductModule[]
): CompanyModule[] =>
  PURCHASABLE_MODULES.map((module) => ({
    module,
    status: enabled.includes(module)
      ? ModuleStatus.ENABLED
      : ModuleStatus.DISABLED,
  }));

// A default "all access" subscription used until a real one is fetched.
export const buildFallbackSubscription = (
  enabled: readonly ProductModule[] = PURCHASABLE_MODULES
): CompanySubscription => ({
  status: "ACTIVE",
  plan: { id: "default", name: "All Access (default)" },
  enabledModules: [...enabled],
  modules: buildModuleList(enabled),
  featureFlags: {},
  isFallback: true,
});

// Resolve the marketplace status of a single module from the effective enabled
// set + the (optional) subscription record. Enabled wins; otherwise we surface
// EXPIRED/TRIAL from the subscription if present, else DISABLED (available to buy).
export const resolveModuleStatus = (
  module: ProductModule,
  enabled: readonly ProductModule[],
  subscription: CompanySubscription | null
): ModuleStatus => {
  const record = subscription?.modules?.find((m) => m.module === module);
  if (enabled.includes(module)) {
    return record?.status === ModuleStatus.TRIAL
      ? ModuleStatus.TRIAL
      : ModuleStatus.ENABLED;
  }
  if (record?.status === ModuleStatus.EXPIRED) return ModuleStatus.EXPIRED;
  return ModuleStatus.DISABLED;
};

// Make a backend subscription safe to consume: guarantee `modules` + `enabledModules`
// are populated and consistent even if the API omitted one of them.
export const normalizeSubscription = (
  raw: CompanySubscription
): CompanySubscription => {
  const enabledModules =
    raw.enabledModules?.length
      ? raw.enabledModules
      : (raw.modules ?? [])
          .filter(
            (m) =>
              m.status === ModuleStatus.ENABLED || m.status === ModuleStatus.TRIAL
          )
          .map((m) => m.module);
  const modules =
    raw.modules?.length ? raw.modules : buildModuleList(enabledModules);
  return {
    ...raw,
    enabledModules,
    modules,
    featureFlags: raw.featureFlags ?? {},
  };
};
