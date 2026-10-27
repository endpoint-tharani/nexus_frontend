import { useQuery } from "@tanstack/react-query";
import { getActiveSessions } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Session } from "../../types";
import { useAuthStore } from "../../store/auth.store";
import type { QueryConfig } from "../shared/types";

// The user's active login sessions. Token-gated like `useMe`.
export const useActiveSessions = (options?: QueryConfig<Session[]>) => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    ...options,
    queryKey: queryKeys.user.sessions(),
    queryFn: async () => {
      const res = await getActiveSessions();
      return res.data.data;
    },
    enabled: !!accessToken && (options?.enabled ?? true),
  });
};
