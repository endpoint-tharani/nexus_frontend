import { useCompanyStore } from "../../store/company.store";
import { useAuthStore } from "../../store/auth.store";

// Resolves the active company id from the store. Every company-scoped query
// and mutation derives its `companyId` here so pages never have to thread it
// through manually. Returns `undefined` when no company is selected — query
// hooks gate on this via `enabled`, mutation hooks assert it with
// `requireCompanyId` at call time.
export const useCompanyId = (): string | undefined => {
  const storeCompanyId = useCompanyStore((s) => s.company?.id);
  const authCompanyId = useAuthStore((s) => s.user?.company?.id);
  return storeCompanyId || authCompanyId;
};

// Narrows an optional company id to a definite string inside a mutationFn.
// Throws (surfaced as the mutation's error) when no company is selected,
// rather than firing a request with a missing scope.
export const requireCompanyId = (companyId: string | undefined): string => {
  if (!companyId) {
    throw new Error("No active company selected.");
  }
  return companyId;
};
