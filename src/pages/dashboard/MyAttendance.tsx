import { useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd } from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import {
  DataTable,
  ErrorState,
  LoadingSkeleton,
  SectionCard,
  StatCard,
  StatusChip,
} from "../../components/ui";
import {
  AttendanceCalendarGrid,
  RequestRegularizationDialog,
} from "../../components/attendance";
import {
  useMyAttendanceCalendar,
  useRegularizations,
} from "../../hooks/attendance";
import { MONTHS } from "../../constants/app";
import { formatDate } from "../../utils/format";
import type { RegularizationRow } from "../../types";

// Selectable calendar-year range around the current year.
const yearOptions = (around: number): number[] =>
  Array.from({ length: 4 }, (_, i) => around - 2 + i);

export default function MyAttendance() {
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [requestOpen, setRequestOpen] = useState(false);

  const {
    data: calendar,
    isLoading,
    isError,
    refetch,
  } = useMyAttendanceCalendar(month, year);

  const employeeId = calendar?.employeeId;

  // My past correction requests (filtered to this employee once known).
  const { data: myRequests } = useRegularizations(
    { employeeId, pageSize: 50 },
    { enabled: !!employeeId }
  );

  const summary = calendar?.summary;

  const years = useMemo(() => yearOptions(now.year()), [now]);

  const requestColumns = useMemo<ColumnDef<RegularizationRow>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: "requested",
        header: "Requested",
        cell: ({ row }) => (
          <StatusChip kind="attendance" status={row.original.requestedStatus} />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusChip kind="regularization" status={row.original.status} />
        ),
      },
      {
        id: "submitted",
        header: "Submitted",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    []
  );

  const periodLabel = `${MONTHS.find((m) => m.value === month)?.label ?? ""} ${year}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      {/* Period selector + request action */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ width: { xs: "100%", sm: 180 } }}
        >
          {MONTHS.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: { xs: "100%", sm: 140 } }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          startIcon={<MdAdd size={18} />}
          onClick={() => setRequestOpen(true)}
          sx={{ ml: { sm: "auto" } }}
        >
          Request regularization
        </Button>
      </Box>

      {isLoading && <LoadingSkeleton variant="card" />}

      {isError && (
        <ErrorState
          description="Couldn't load your attendance. You may not have an employee profile linked to this account."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && summary && (
        <>
          {/* Monthly summary */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
            }}
          >
            <StatCard label="Present" value={summary.presentDays} color="success" />
            <StatCard label="Absent" value={summary.absentDays} color="error" />
            <StatCard label="Paid leave" value={summary.paidLeaveDays} color="info" />
            <StatCard label="LOP days" value={summary.lopDays} color="warning" />
            <StatCard label="Payable days" value={summary.payableDays} color="primary" />
          </Box>

          <SectionCard
            title={`Calendar — ${periodLabel}`}
            subtitle="Your day-by-day attendance for the selected month."
          >
            <AttendanceCalendarGrid days={calendar?.days ?? []} />
          </SectionCard>

          <SectionCard
            title="My regularization requests"
            subtitle="Corrections you've submitted and their review status."
          >
            {myRequests && myRequests.items.length > 0 ? (
              <DataTable
                columns={requestColumns}
                data={myRequests.items}
                enablePagination={myRequests.items.length > 10}
                ariaLabel="My regularization requests"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                You haven't submitted any regularization requests.
              </Typography>
            )}
          </SectionCard>
        </>
      )}

      <RequestRegularizationDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        defaultDate={dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format(
          "YYYY-MM-DD"
        )}
      />
    </Box>
  );
}
