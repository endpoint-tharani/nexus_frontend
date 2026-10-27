import { queryClient } from "../providers/QueryProvider";
import { useAuthStore } from "../store/auth.store";
import { useCompanyStore } from "../store/company.store";
import { useModuleStore } from "../store/module.store";

/**
 * Completely purges all client-side authentication, query cache, Zustand stores,
 * and web storage (localStorage / sessionStorage) when a user logs out.
 */
export const clearAppSession = (): void => {
  // Preserve non-sensitive UI preferences (e.g. theme preference)
  const themeStorage = localStorage.getItem("theme-storage");

  try {
    localStorage.clear();
    sessionStorage.clear();
    if (themeStorage) {
      localStorage.setItem("theme-storage", themeStorage);
    }
  } catch (err) {
    console.error("Failed to clear browser storage:", err);
  }

  // Clear React Query API cache so next user does not see previously cached queries
  try {
    queryClient.clear();
  } catch (err) {
    console.error("Failed to clear query cache:", err);
  }

  // Reset in-memory stores
  useAuthStore.getState().logout();
  useCompanyStore.getState().clearCompany();
  useModuleStore.getState().reset();
};
