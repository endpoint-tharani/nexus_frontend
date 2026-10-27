import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys";
import type { CompanySubscription, Invoice } from "../../types";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import type { QueryConfig } from "../../hooks/shared/types";
import { getInvoices, getSubscriptionAccess } from "./subscription.api";
import {
  buildFallbackSubscription,
  normalizeSubscription,
  buildModuleList,
} from "./subscription.fallback";

// The active subscription for the current company. Resilient by design: if the
// endpoint is missing (backend hasn't shipped it) or errors, it resolves to a
// graceful "default access" record rather than failing the dashboard.
export const useSubscription = (options?: QueryConfig<CompanySubscription>) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.subscription.detail(companyId ?? ""),
    queryFn: async () => {
      try {
        const res = await getSubscriptionAccess(companyId ?? "");
        const access = res.data.data;
        if (!access || !access.subscription) {
          return buildFallbackSubscription();
        }
        return normalizeSubscription({
          status: access.subscription.isActive ? "ACTIVE" : "EXPIRED",
          plan: {
            id: access.subscription.planId,
            name: access.subscription.planName,
            interval: "MONTHLY",
          },
          enabledModules: access.enabledModules,
          modules: buildModuleList(access.enabledModules),
          featureFlags: access.capabilities ?? {},
          isFallback: false,
        });
      } catch {
        // No subscription endpoint / company not provisioned yet → default access.
        return buildFallbackSubscription();
      }
    },
    enabled: !!companyId && (options?.enabled ?? true),
    staleTime: 5 * 60_000,
  });
};

// Billing history. Tolerates a missing endpoint by returning an empty list.
export const useInvoices = (options?: QueryConfig<Invoice[]>) => {
  const companyId = useCompanyId();

  return useQuery({
    ...options,
    queryKey: queryKeys.subscription.invoices(companyId ?? ""),
    queryFn: async () => {
      try {
        const res = await getInvoices(companyId ?? "");
        return res.data.data ?? [];
      } catch {
        return [] as Invoice[];
      }
    },
    enabled: !!companyId && (options?.enabled ?? true),
    staleTime: 5 * 60_000,
  });
};
