import { useMutation } from "@tanstack/react-query";
import { logoutAllDevices } from "../../api/user.api";

// Sign out of every device. The api layer clears local tokens in its `finally`;
// the caller is responsible for clearing app state (auth/company stores) and
// redirecting to /login on success.
export const useLogoutAllDevices = () =>
  useMutation<null, Error, void>({
    mutationFn: async () => {
      const res = await logoutAllDevices();
      return res.data.data;
    },
  });
