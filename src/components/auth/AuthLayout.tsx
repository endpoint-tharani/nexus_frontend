import { type ReactNode } from "react";
import { Box, useTheme } from "@mui/material";
import { Logo, ThemeSwitcher } from "../common";
import BrandPanel from "./BrandPanel";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 3, sm: 6 }, // 48px padding on desktop, 24px on mobile
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Floating Theme Switcher */}
      <Box sx={{ position: "absolute", top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10 }}>
        <ThemeSwitcher />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "1440px",
          display: "grid",
          // Desktop is 45% (4.5) left / 55% (5.5) right
          // Tablet is 60% (6) left / 40% (4) right
          // Mobile collapses the left panel entirely
          gridTemplateColumns: { xs: "1fr", md: "6fr 4fr", lg: "4.5fr 5.5fr" },
          gap: { xs: 4, md: 6, lg: 8 },
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Left Branding Panel (Hidden on Mobile) */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: "100%",
            height: "100%",
          }}
        >
          <BrandPanel />
        </Box>

        {/* Right Authentication Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* Mobile-only logo */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 4,
              alignSelf: "flex-start",
            }}
          >
            <Logo size={28} onDark={isDark} />
          </Box>

          {children}
        </Box>
      </Box>
    </Box>
  );
}
