import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { MdBeachAccess } from "react-icons/md";

import { HOLIDAY_TYPE_COLORS, HOLIDAY_TYPE_LABELS, WEEKDAYS } from "../../constants/enums";
import type { Holiday, HolidayCalendarResult } from "../../types";
import { EmptyState, LoadingSkeleton } from "../ui";

export interface HolidayCalendarProps {
  data?: HolidayCalendarResult;
  loading?: boolean;
  onHolidayClick?: (holiday: Holiday) => void;
}

// Parse the date-only ISO string in UTC so the displayed day never drifts with
// the browser timezone.
const formatHolidayDay = (iso: string): { day: string; weekday: string } => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return {
    day: String(d).padStart(2, "0"),
    weekday: WEEKDAYS[date.getUTCDay()]?.short ?? "",
  };
};

// Year-at-a-glance holiday calendar: one card per month, each listing that
// month's holidays. Read-only; clicking a holiday (when handled) opens it.
export default function HolidayCalendar({
  data,
  loading = false,
  onHolidayClick,
}: HolidayCalendarProps) {
  if (loading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  if (!data || data.total === 0) {
    return (
      <Paper variant="outlined">
        <EmptyState
          icon={<MdBeachAccess size={32} />}
          title="No holidays configured"
          description="Add holidays to build the calendar for this year."
        />
      </Paper>
    );
  }

  const monthsWithHolidays = data.months.filter((m) => m.count > 0);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
        gap: 2,
      }}
    >
      {monthsWithHolidays.map((month) => (
        <Paper key={month.month} variant="outlined" sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {month.label}
            </Typography>
            <Chip label={`${month.count}`} size="small" />
          </Box>

          <Stack spacing={1}>
            {month.holidays.map((holiday) => {
              const { day, weekday } = formatHolidayDay(holiday.date);
              return (
                <Box
                  key={holiday.id}
                  onClick={onHolidayClick ? () => onHolidayClick(holiday) : undefined}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1,
                    borderRadius: 1,
                    cursor: onHolidayClick ? "pointer" : "default",
                    "&:hover": onHolidayClick ? { bgcolor: "action.hover" } : undefined,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 44,
                      textAlign: "center",
                      borderRadius: 1,
                      bgcolor: "action.selected",
                      py: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                      {day}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {weekday}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {holiday.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                      <Chip
                        label={HOLIDAY_TYPE_LABELS[holiday.type]}
                        size="small"
                        color={HOLIDAY_TYPE_COLORS[holiday.type]}
                        variant="outlined"
                      />
                      {holiday.isOptional && (
                        <Chip label="Optional" size="small" color="warning" variant="outlined" />
                      )}
                      {holiday.branchId && (
                        <Chip label="Branch" size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
