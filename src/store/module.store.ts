import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ProductModule,
  PURCHASABLE_MODULES,
  orderModules,
  parseModules,
} from "../constants/modules";
import type { CompanySubscription } from "../types";

// =============================================================================
// MODULE STORE — the single client-side source of truth for which product
// modules are active for the signed-in company. Seeded from the auth response /
// `/user/me` / the subscription endpoint (see `core/subscription`). Persisted so
// the sidebar + routes resolve correctly on reload before the network settles.
// =============================================================================

interface ModuleState {
  // `null` = not yet resolved. An explicit (possibly empty) array means the
  // backend/UI told us exactly which modules are on.
  enabledModules: ProductModule[] | null;
  subscription: CompanySubscription | null;
  featureFlags: Record<string, boolean>;

  setEnabledModules: (modules: ProductModule[]) => void;
  setSubscription: (subscription: CompanySubscription | null) => void;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  // Simulate a purchase/cancellation locally (also used by the Subscription UI).
  enableModule: (module: ProductModule) => void;
  disableModule: (module: ProductModule) => void;
  reset: () => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      enabledModules: null,
      subscription: null,
      featureFlags: {},

      setEnabledModules: (modules) =>
        set({ enabledModules: orderModules(parseModules(modules)) }),

      setSubscription: (subscription) => set({ subscription }),

      setFeatureFlags: (featureFlags) => set({ featureFlags }),

      enableModule: (module) =>
        set((state) => {
          const next = new Set(state.enabledModules ?? PURCHASABLE_MODULES);
          next.add(module);
          return { enabledModules: orderModules([...next]) };
        }),

      disableModule: (module) =>
        set((state) => {
          // CORE can never be disabled — it carries the always-on chrome.
          if (module === ProductModule.CORE) return state;
          const next = new Set(state.enabledModules ?? PURCHASABLE_MODULES);
          next.delete(module);
          return { enabledModules: orderModules([...next]) };
        }),

      reset: () =>
        set({ enabledModules: null, subscription: null, featureFlags: {} }),
    }),
    { name: "module-storage" }
  )
);
