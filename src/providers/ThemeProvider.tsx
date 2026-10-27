import { type ReactNode, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "../store/theme.store";
import { getTheme } from "../theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeMode = useThemeStore((s) => s.themeMode);
  
  const theme = useMemo(() => {
    return getTheme(themeMode);
  }, [themeMode]);

  const { palette } = theme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: palette.background.paper,
            color: palette.text.primary,
            border: `1px solid ${palette.divider}`,
            fontSize: "0.875rem",
            borderRadius: "12px",
          },
          success: {
            iconTheme: {
              primary: palette.success.main,
              secondary: palette.background.paper,
            },
          },
          error: {
            iconTheme: {
              primary: palette.error.main,
              secondary: palette.background.paper,
            },
          },
        }}
      />
      {children}
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
