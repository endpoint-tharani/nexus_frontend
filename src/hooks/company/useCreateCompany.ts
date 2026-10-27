import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany } from "../../api/company.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Company, CreateCompanyPayload } from "../../types";

// Create a brand-new company. The backend makes the caller its OWNER and sets
// their `companyId` (see createCompany.repo.ts), so we refresh `/user/me` — the
// role + active company both change — and prime the new company's detail cache.
// Seeding the active company in the store is the caller's job; that store id is
// what `useCompanyId` (and every company-scoped query) resolves against.
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, CreateCompanyPayload>({
    mutationFn: async (data) => {
      const res = await createCompany(data);
      return res.data.data;
    },
    onSuccess: (created) => {
      // The caller is now OWNER with a new companyId — refresh the identity so
      // the role-based shell/guards pick up ownership.
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.detail(created.id),
      });
    },
  });
};
