import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import type { UpdateProfilePayload, User } from "../../types";

// Update the current user's profile (currently just `name`), then seed + refresh
// the cached `/user/me` so the sidebar and profile header reflect it at once.
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfilePayload>({
    mutationFn: async (data) => {
      const res = await updateMe(data);
      return res.data.data;
    },
    onSuccess: (user) => {
      // Merge, don't replace: update-me may echo a slim user without the assumed
      // role/company join — preserve those from the cached /user/me.
      queryClient.setQueryData<User>(queryKeys.user.me(), (prev) =>
        prev ? { ...prev, ...user } : user
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
};
