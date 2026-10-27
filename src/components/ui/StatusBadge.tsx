import type { ReactElement } from "react";
import { Chip } from "@mui/material";

export type BadgeType = "success" | "warning" | "error" | "info" | "default";

export interface StatusBadgeProps {
  label: string;
  type?: BadgeType;
  icon?: ReactElement;
  variant?: "filled" | "outlined";
}

const BADGE_COLORS: Record<BadgeType, "success" | "warning" | "error" | "info" | "default"> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  default: "default",
};

export default function StatusBadge({
  label,
  type = "default",
  icon,
  variant = "outlined",
}: StatusBadgeProps) {
  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      color={BADGE_COLORS[type]}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: "12px",
        height: 22,
        borderRadius: "4px",
        px: 0.5,
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}
