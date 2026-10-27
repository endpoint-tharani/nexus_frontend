import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompanyRole } from "../constants/enums";
import { clearTokens, setTokens } from "../api/axios";

// Mirrors the domain `User` (src/types/user.types.ts) but every field is
// optional: the persisted store holds whatever the login / `/user/me` payload
// provided. `role` + `company` back the role-based sidebar and company bootstrap.
interface User {
  id?: string;
  name?: string;
  email?: string;
  isEmailVerified?: boolean;
  role?: CompanyRole;
  company?: { id: string; name: string };
  branchId?: string | null;
  departmentId?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => void;

  // Patch the cached user without touching tokens (e.g. after a profile update
  // or once `/user/me` resolves with role + company).
  setUser: (user: User) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
        });
      },

      setUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        })),

      logout: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
