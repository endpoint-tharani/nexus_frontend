import type { ReactNode } from "react";
import { Box, Card, Skeleton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { StatColor } from "../ui";
import {
  MdCancel,
  MdCheckCircle,
  MdHourglassEmpty,
  MdOutlineDrafts,
  MdOutlinePendingActions,
} from "react-icons/md";

import type { TaxSummary } from "../../types";

export interface TaxSummaryCardsProps {
  summary?: TaxSummary;
  loading?: boolean;
}

// One card per workflow state plus a "Not Started" bucket for employees who have
// no declaration yet — so the admin sees true coverage, not just those who began.
const CARDS: {
  key: keyof TaxSummary;
  label: string;
  color: StatColor;
  icon: ReactNode;
}[] = [
  { key: "draftCount", label: "Draft", color: "secondary", icon: <MdOutlineDrafts size={22} /> },
  { key: "submittedCount", label: "Submitted", color: "info", icon: <MdOutlinePendingActions size={22} /> },
  { key: "approvedCount", label: "Approved", color: "success", icon: <MdCheckCircle size={22} /> },
  { key: "rejectedCount", label: "Rejected", color: "error", icon: <MdCancel size={22} /> },
  { key: "notStartedCount", label: "Not Started", color: "warning", icon: <MdHourglassEmpty size={22} /> },
];

// Aggregated declaration counts for the active company + financial year. Built on
// the StatCard visual language (accented icon badge) and the theme palette — no
// hardcoded colors.
export default function TaxSummaryCards({
  summary,
  loading = false,
}: TaxSummaryCardsProps) {
  const base = summary?.totalEmployees ?? 0;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 1.5,
        mb: 2,
      }}
    >
      {CARDS.map(({ key, label, color, icon }) => {
        const count = (summary?.[key] as number | undefined) ?? 0;
        const pct = base > 0 ? Math.round((count / base) * 100) : null;

        return (
          <Card
            key={key}
            sx={{
              p: 1.75,
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: `${color}.main`,
                bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
              }}
            >
              {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {label}
              </Typography>

              {loading ? (
                <Skeleton width={56} height={28} />
              ) : (
                <Box
                  sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, lineHeight: 1.1 }}
                  >
                    {count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {pct === null ? "" : `${pct}% of ${base}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
