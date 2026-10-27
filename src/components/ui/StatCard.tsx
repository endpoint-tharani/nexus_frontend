import type { ReactNode } from "react";
import { Box, Card, Skeleton, Typography } from "@mui/material";
import { MdArrowUpward, MdArrowDownward, MdRemove } from "react-icons/md";

export type StatColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type TrendDirection = "up" | "down" | "flat";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  /** Trend text, e.g. "+12.5%" or "3 this week". */
  trend?: ReactNode;
  trendDirection?: TrendDirection;
  /** Accent color for the icon badge (default primary). */
  color?: StatColor;
  loading?: boolean;
}

const TREND_ICON: Record<TrendDirection, ReactNode> = {
  up: <MdArrowUpward size={12} />,
  down: <MdArrowDownward size={12} />,
  flat: <MdRemove size={12} />,
};
const TREND_COLOR: Record<TrendDirection, string> = {
  up: "success.main",
  down: "error.main",
  flat: "text.secondary",
};

/**
 * Enterprise KPI stat card.
 * Layout: small monochrome icon → label → large value → optional trend.
 * Height: ~90px. No colored backgrounds. No icon circles.
 */
export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendDirection = "flat",
  loading = false,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2, // 16px
        minHeight: 90,
        height: "100%",
        border: "none",
        borderRadius: "10px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0.25,
        transition: "box-shadow 120ms ease",
        "&:hover": {
          boxShadow: "0 2px 6px rgba(15,23,42,0.10)",
        },
      }}
    >
      {/* Icon + label row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
        {icon && (
          <Box
            aria-hidden
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.secondary",
              flexShrink: 0,
              "& svg": { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, lineHeight: 1.4, letterSpacing: "0.01em" }}
        >
          {label}
        </Typography>
      </Box>

      {/* Value */}
      {loading ? (
        <Skeleton width="55%" height={28} />
      ) : (
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            lineHeight: 1.25,
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
      )}

      {/* Trend */}
      {trend != null && !loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            mt: 0.25,
            color: TREND_COLOR[trendDirection],
            fontWeight: 500,
          }}
        >
          {TREND_ICON[trendDirection]}
          <Typography
            component="span"
            sx={{ fontSize: "inherit", fontWeight: "inherit", color: "inherit" }}
          >
            {trend}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
