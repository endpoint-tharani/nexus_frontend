import type { ReactNode } from "react";
import { Box, Card, Divider, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned header actions (buttons, menus…). */
  actions?: ReactNode;
  children: ReactNode;
  /** Show a divider between header and content (default true when titled). */
  divider?: boolean;
  /** Remove the default content padding (e.g. to host an edge-to-edge table). */
  disableContentPadding?: boolean;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

/**
 * Reusable titled content container — the standard grouping surface for forms,
 * detail panels and table sections. Uses elevation=0 with an explicit border
 * to match the design spec (no MUI shadow; consistent with the card token).
 */
export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  divider = true,
  disableContentPadding = false,
  sx,
  contentSx,
}: SectionCardProps) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "10px",
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      {hasHeader && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box sx={{ flexShrink: 0, display: "flex", gap: 1 }}>{actions}</Box>
            )}
          </Box>
          {divider && <Divider />}
        </>
      )}
      <Box sx={{ p: disableContentPadding ? 0 : 2, ...contentSx }}>{children}</Box>
    </Card>
  );
}
