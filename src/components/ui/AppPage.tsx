import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface AppPageProps {
  children: ReactNode;
  /**
   * Maximum width of the content column. Defaults to 1280px (a comfortable
   * enterprise line-length that leaves room for the sidebar).
   */
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}

/**
 * Standardised page-level wrapper. Enforces consistent horizontal padding,
 * a max-width constraint, and top/bottom breathing room so every page has
 * the same spatial rhythm without duplicating the sx boilerplate.
 *
 * Usage:
 *   <AppPage>
 *     <PageHeader … />
 *     …content…
 *   </AppPage>
 */
export default function AppPage({ children, maxWidth = 1280, sx }: AppPageProps) {
  return (
    <Box
      sx={{
        maxWidth,
        mx: "auto",
        px: { xs: 1.5, sm: 2 },
        py: { xs: 2, sm: 2 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
