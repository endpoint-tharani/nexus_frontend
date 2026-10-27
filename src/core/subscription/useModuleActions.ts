import { useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MODULE_META } from "../../constants/modules";
import type { ProductModule } from "../../constants/modules";
import { useModuleStore } from "../../store/module.store";
import { enableModuleApi, disableModuleApi } from "./subscription.api";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { queryKeys } from "../../constants/queryKeys";

// Actions that enable/disable a module for the company.
// Calls the backend update endpoints and invalidates the access context cache,
// so that the entire navigation and UI updates reactively.
export const useModuleActions = () => {
  const companyId = useCompanyId();
  const queryClient = useQueryClient();
  const enable = useModuleStore((s) => s.enableModule);
  const disable = useModuleStore((s) => s.disableModule);

  const enableMutation = useMutation({
    mutationFn: (module: ProductModule) => enableModuleApi(companyId ?? "", module),
    onSuccess: (_, module) => {
      enable(module);
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.access(companyId),
        });
      }
      toast.success(`${MODULE_META[module].label} enabled`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to enable module");
    },
  });

  const disableMutation = useMutation({
    mutationFn: (module: ProductModule) => disableModuleApi(companyId ?? "", module),
    onSuccess: (_, module) => {
      disable(module);
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscription.access(companyId),
        });
      }
      toast(`${MODULE_META[module].label} disabled`, { icon: "🚫" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to disable module");
    },
  });

  const enableModule = useCallback(
    (module: ProductModule) => {
      enableMutation.mutate(module);
    },
    [enableMutation]
  );

  const disableModule = useCallback(
    (module: ProductModule) => {
      disableMutation.mutate(module);
    },
    [disableMutation]
  );

  return { enableModule, disableModule };
};
