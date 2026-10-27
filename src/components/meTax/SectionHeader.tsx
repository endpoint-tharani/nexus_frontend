import type { ReactNode } from "react";
import { Box, Chip, Typography } from "@mui/material";

export interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional badge count (e.g. number of previous employment records). */
  badge?: number | null;
  /**
   * Legacy color prop — kept for backward compat but no longer drives a
   * background circle. All icons render monochrome (text.secondary).
   */
  iconColor?: string;
  color?: string;
}

/**
 * Enterprise accordion / section heading.
 * Monochrome 18px icon — no colored background circle.
 * Title: subtitle2 weight 500. Subtitle: caption text.secondary.
 */
export default function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
}: SectionHeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0 }}>
      {/* Monochrome icon — no bgcolor circle */}
      <Box
        aria-hidden
        sx={{
          display: "flex",
          alignItems: "center",
          color: "text.secondary",
          flexShrink: 0,
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>

      {/* Title + badge + subtitle */}
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "nowrap" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary", lineHeight: 1.4 }}
          >
            {title}
          </Typography>
          {badge != null && badge > 0 && (
            <Chip
              label={badge}
              size="small"
              variant="outlined"
              sx={{
                height: 18,
                fontWeight: 600,
                color: "primary.main",
                borderColor: "primary.main",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Box>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ lineHeight: 1.4 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
