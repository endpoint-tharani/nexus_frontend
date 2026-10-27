import { useMemo } from "react";
import {
  ProductModule,
  PURCHASABLE_MODULES,
  orderModules,
  parseModules,
} from "../../constants/modules";
import type { CompanySubscription } from "../../types";
import { useSubscriptionAccess } from "../subscription/useSubscriptionAccess";

// =============================================================================
// MODULE PERMISSION SYSTEM
//
// Pure helpers + reactive hooks for "does this company have access to module X".
// CORE is always present in the effective set, so the always-on chrome
// (Dashboard / Subscription) can never be locked out.
// =============================================================================

// ---- pure predicates (usable outside React, e.g. in the registry) ----------
export const hasModuleAccess = (
  enabled: readonly ProductModule[],
  module: ProductModule
): boolean => enabled.includes(module);

export const hasAnyModule = (
  enabled: readonly ProductModule[],
  modules: readonly ProductModule[]
): boolean => modules.some((m) => enabled.includes(m));

export const hasAllModules = (
  enabled: readonly ProductModule[],
  modules: readonly ProductModule[]
): boolean => modules.every((m) => enabled.includes(m));

// ---- effective-module resolution -------------------------------------------
// A dev/QA override so the Company A/B/C/D scenarios can be simulated without a
// backend: set `localStorage["dev:enabledModules"] = "TAX_DECLARATION"` (or a
// comma list), or build with `VITE_ENABLED_MODULES`. Takes precedence over the
// store so you can force any combination.
const readDevOverride = (): ProductModule[] | null => {
  let raw: string | null | undefined;
  try {
    raw = localStorage.getItem("dev:enabledModules");
  } catch {
    raw = null;
  }
  raw = raw ?? (import.meta.env.VITE_ENABLED_MODULES as string | undefined);
  if (!raw) return null;
  const parsed = parseModules(raw);
  return parsed.length ? parsed : null;
};

// Resolution priority:
//   1. dev override (localStorage / env)
//   2. explicit store value (set by login / subscription / the Subscription UI)
//   3. subscription.enabledModules
//   4. graceful fallback: every purchasable module (keeps the app fully usable
//      until the backend starts reporting modules)
// CORE is always folded in.
export const resolveEnabledModules = (
  stored: ProductModule[] | null,
  subscription: CompanySubscription | null
): ProductModule[] => {
  const override = readDevOverride();
  const source =
    override ??
    (stored && stored.length ? stored : null) ??
    (subscription?.enabledModules?.length ? subscription.enabledModules : null) ??
    PURCHASABLE_MODULES;
  return orderModules([ProductModule.CORE, ...source]);
};

// ---- hooks ------------------------------------------------------------------
// The effective, ordered list of enabled modules for the current company.
export const useEnabledModules = (): ProductModule[] => {
  const { enabledModules, subscription } = useSubscriptionAccess();
  return useMemo(() => {
    const override = readDevOverride();
    if (override) {
      return orderModules([ProductModule.CORE, ...override]);
    }

    const isSubscriptionActive =
      subscription !== null &&
      subscription.isActive === true &&
      enabledModules &&
      enabledModules.length > 0;

    if (!isSubscriptionActive) {
      return [ProductModule.CORE];
    }

    return orderModules([ProductModule.CORE, ...enabledModules]);
  }, [enabledModules, subscription]);
};

export interface ModuleAccess {
  enabledModules: ProductModule[];
  hasModuleAccess: (module: ProductModule) => boolean;
  hasAnyModule: (modules: readonly ProductModule[]) => boolean;
  hasAllModules: (modules: readonly ProductModule[]) => boolean;
}

// The headline hook. Components call `useModuleAccess()` and gate on the returned
// predicates; everything stays reactive to subscription changes.
export const useModuleAccess = (): ModuleAccess => {
  const enabledModules = useEnabledModules();
  return useMemo(
    () => ({
      enabledModules,
      hasModuleAccess: (module) => hasModuleAccess(enabledModules, module),
      hasAnyModule: (modules) => hasAnyModule(enabledModules, modules),
      hasAllModules: (modules) => hasAllModules(enabledModules, modules),
    }),
    [enabledModules]
  );
};

// Single-module convenience hook for inline gating.
export const useHasModule = (module: ProductModule): boolean => {
  const enabledModules = useEnabledModules();
  return hasModuleAccess(enabledModules, module);
};

// Read a feature flag (finer-grained than a whole module). Defaults to `false`.
export const useFeatureFlag = (flag: string): boolean => {
  const { capabilities } = useSubscriptionAccess();
  return capabilities[flag] ?? false;
};
