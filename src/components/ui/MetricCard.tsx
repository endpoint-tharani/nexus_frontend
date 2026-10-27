import type { ReactNode } from "react";
import { Box, Card, Typography } from "@mui/material";

export interface MetricCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  trendColor?: string;
}

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  trendColor = "#6B7280",
}: MetricCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
        boxSizing: "border-box",
        transition: "all 0.15s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px 0 rgba(15, 23, 42, 0.05)",
          borderColor: "primary.light",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </Typography>
        {icon && (
          <Box sx={{ color: "text.secondary", display: "flex", "& svg": { fontSize: 20 } }}>
            {icon}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            lineHeight: "36px",
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: trendColor,
            }}
          >
            {trend}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
