import { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import dayjs from "dayjs";

import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from "../../constants/enums";
import type { AttendanceStatus } from "../../constants/enums";
import { formatDate } from "../../utils/format";
import type { AttendanceCalendarDay } from "../../types";

export interface AttendanceCalendarGridProps {
  days: AttendanceCalendarDay[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Background + text styling for a status cell, derived from the same chip-color
// language as <StatusChip> so the calendar and the log never disagree.
const cellSx = (theme: Theme, status: AttendanceStatus) => {
  const family = ATTENDANCE_STATUS_COLORS[status];
  if (family === "default") {
    return {
      bgcolor: theme.palette.action.hover,
      color: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
    };
  }
  const main = theme.palette[family].main;
  return {
    bgcolor: alpha(main, 0.14),
    color: main,
    borderColor: alpha(main, 0.4),
  };
};

// A single-month attendance calendar. Every day in the month is rendered (the
// backend synthesizes holidays/weekly-offs/absences), tinted + labelled by its
// status, with a tooltip carrying the full date + status.
export default function AttendanceCalendarGrid({
  days,
}: AttendanceCalendarGridProps) {
  const theme = useTheme();

  // Blank leading cells so the first day lands under the right weekday.
  const leadingBlanks = useMemo(
    () => (days.length ? dayjs(days[0].date).day() : 0),
    [days]
  );

  // Distinct statuses present this month — drives a compact legend.
  const legend = useMemo(() => {
    const seen = new Set<AttendanceStatus>();
    days.forEach((d) => seen.add(d.status));
    return Array.from(seen);
  }, [days]);

  if (!days.length) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
        }}
      >
        {WEEKDAYS.map((weekday) => (
          <Typography
            key={weekday}
            variant="caption"
            align="center"
            color="text.secondary"
            sx={{ fontWeight: 600, py: 0.5 }}
          >
            {weekday}
          </Typography>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <Box key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const sx = cellSx(theme, day.status);
          return (
            <Tooltip
              key={day.date}
              title={`${formatDate(day.date)} — ${ATTENDANCE_STATUS_LABELS[day.status]}${
                day.dayValue !== 1 ? ` (${day.dayValue} day)` : ""
              }`}
            >
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: sx.borderColor,
                  bgcolor: sx.bgcolor,
                  borderRadius: 1.5,
                  minHeight: 56,
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {dayjs(day.date).date()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: sx.color,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    fontSize: "0.6875rem",
                  }}
                >
                  {ATTENDANCE_STATUS_LABELS[day.status]}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {legend.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          {legend.map((status) => {
            const sx = cellSx(theme, status);
            return (
              <Box
                key={status}
                sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.75,
                    border: "1px solid",
                    borderColor: sx.borderColor,
                    bgcolor: sx.bgcolor,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {ATTENDANCE_STATUS_LABELS[status]}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
