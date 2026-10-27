import { useEffect } from "react";
import { useModuleStore } from "../../store/module.store";
import { useSubscriptionAccess } from "./useSubscriptionAccess";

// Seeds the module store from the resolved backend subscription access. Mounted once
// in the dashboard shell. It writes the authoritative server modules, feature flags,
// and subscription info into the Zustand store, so all reactive guards update instantly.
export const useModuleBootstrap = (): void => {
  const { enabledModules, capabilities, subscription } = useSubscriptionAccess();
  const setSubscription = useModuleStore((s) => s.setSubscription);
  const setEnabledModules = useModuleStore((s) => s.setEnabledModules);
  const setFeatureFlags = useModuleStore((s) => s.setFeatureFlags);

  useEffect(() => {
    if (enabledModules && enabledModules.length > 0) {
      setEnabledModules(enabledModules);
    }
    if (capabilities) {
      setFeatureFlags(capabilities);
    }
    if (subscription) {
      setSubscription({
        status: subscription.isActive ? "ACTIVE" : "EXPIRED",
        plan: {
          id: subscription.planId,
          name: subscription.planName,
        },
        enabledModules: enabledModules || [],
        modules: [],
        featureFlags: capabilities || {},
        isFallback: false,
      });
    }
  }, [
    enabledModules,
    capabilities,
    subscription,
    setSubscription,
    setEnabledModules,
    setFeatureFlags,
  ]);
};
