import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import type { User } from "../../types";
import { useAuthStore } from "../../store/auth.store";
import type { QueryConfig } from "../shared/types";

// The authenticated user's profile (incl. the assumed role + company summary).
// Gated on an access token so it only fires once signed in. This is the
// canonical current-user source for the profile page and the role-based shell.
export const useMe = (options?: QueryConfig<User>) => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    ...options,
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      const res = await getMe();
      const raw = res.data.data;
      // The backend exposes the role as `userRole` and the company as a bare
      // `companyId` string. Normalize `userRole` → `role` so the role-based
      // sidebar/guards and owner-gating read a single field; `companyId` is
      // surfaced for the shell to seed the active company.
      return { ...raw, role: raw.role ?? raw.userRole };
    },
    enabled: !!accessToken && (options?.enabled ?? true),
  });
};
