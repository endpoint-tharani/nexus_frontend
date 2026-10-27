import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeSession } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";

// Revoke a single session by id, then refresh the session list.
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation<null, Error, string>({
    mutationFn: async (sessionId) => {
      const res = await revokeSession(sessionId);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.sessions() });
    },
  });
};
