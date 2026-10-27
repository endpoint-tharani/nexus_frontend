import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { getSubscriptionAccess } from "./subscription.api";
import { useAuthStore } from "../../store/auth.store";

/**
 * React Query hook to fetch the active subscription, enabled modules,
 * capabilities (feature flags), and dynamic navigation structures from the backend.
 * Provides a single source of truth for the frontend UI.
 */
export const useSubscriptionAccess = (options?: { refetchInterval?: number }) => {
  const companyId = useCompanyId();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.subscription.access(companyId ?? ""),
    queryFn: async () => {
      try {
        const res = await getSubscriptionAccess(companyId ?? "");
        return res.data.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw err;
        }
        console.warn("Failed to fetch subscription access, using offline fallback.", err);
        return {
          companyId: companyId ?? "",
          subscription: null,
          enabledModules: [],
          capabilities: {},
          navigation: {
            base: [
              { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: "dashboard" }
            ],
            management: [
              { key: "employees", label: "Employees", path: "/dashboard/employees", icon: "users" }
            ],
            sections: [],
            workspace: [
              { key: "profile", label: "Profile", path: "/dashboard/profile", icon: "user" },
              { key: "sessions", label: "Sessions", path: "/dashboard/sessions", icon: "MdDevices" },
              { key: "departments", label: "Departments", path: "/dashboard/departments", icon: "MdAccountTree" },
              { key: "company", label: "Company", path: "/dashboard/company", icon: "building" },
              { key: "subscription", label: "Subscription", path: "/dashboard/subscription", icon: "MdWorkspacePremium" }
            ]
          }
        };
      }
    },
    enabled: !!companyId,
    staleTime: options?.refetchInterval ? 0 : 5 * 60_000,
    refetchInterval: options?.refetchInterval,
  });

  const isCompanyNotFound = (error as any)?.response?.status === 404;

  return {
    subscription: data?.subscription ?? null,
    enabledModules: data?.enabledModules ?? [],
    capabilities: data?.capabilities ?? {},
    navigation: data?.navigation ?? { base: [], management: [], sections: [], workspace: [] },
    loading: isSuperAdmin ? (companyId ? isLoading : false) : (isLoading || !companyId) && !isCompanyNotFound,
    error: error ?? null,
    isCompanyNotFound,
  };
};
