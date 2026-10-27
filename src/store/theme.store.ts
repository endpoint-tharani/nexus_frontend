import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "auronox";

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "light",
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: "theme-storage",
    }
  )
);
