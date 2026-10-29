import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { layout } from "../../theme";

export interface PageContainerProps {
  children: ReactNode;
  /** Max content width in px, or "full" to span the available area. */
  maxWidth?: number | "full";
  /** Remove the horizontal page padding (e.g. full-bleed dashboards). */
  disableGutters?: boolean;
  sx?: SxProps<Theme>;
}

// Standard page wrapper: centers content, caps its width, and applies the
// consistent responsive page padding. The dashboard shell wraps every routed
// page in this, so individual pages never re-implement page spacing.
export default function PageContainer({
  children,
  maxWidth = layout.contentMaxWidth,
  disableGutters = false,
  sx,
}: PageContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: maxWidth === "full" ? "100%" : maxWidth,
        mx: "auto",
        px: disableGutters ? 0 : { xs: 2, sm: 3, lg: 4 },
        py: { xs: 2.5, sm: 3.5 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
