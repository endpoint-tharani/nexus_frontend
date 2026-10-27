import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../api/user.api";
import type { ChangePasswordPayload } from "../../types";

// Change the current user's password. No cache to invalidate; the UI resets the
// form and toasts on success. Errors surface via the mutation's `error`.
export const useChangePassword = () =>
  useMutation<null, Error, ChangePasswordPayload>({
    mutationFn: async (data) => {
      const res = await changePassword(data);
      return res.data.data;
    },
  });
