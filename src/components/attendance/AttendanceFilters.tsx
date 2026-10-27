import type { ReactNode } from "react";
import { Box, MenuItem, TextField } from "@mui/material";

import { ATTENDANCE_STATUS_OPTIONS } from "../../constants/enums";
import type { AttendanceStatus } from "../../constants/enums";
import type { AttendanceEmployeeRef } from "../../types";

export interface AttendanceFiltersProps {
  date: string; // YYYY-MM-DD
  employeeId: string;
  status: AttendanceStatus | "";
  employees: AttendanceEmployeeRef[];
  employeesLoading?: boolean;
  onDateChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onStatusChange: (value: AttendanceStatus | "") => void;
  // Optional trailing controls (page actions) right-aligned on the same row.
  actions?: ReactNode;
}

// Fully controlled filter bar for the attendance log. Holds no state of its own
// so the active company's query key stays the single source of truth.
export default function AttendanceFilters({
  date,
  employeeId,
  status,
  employees,
  employeesLoading = false,
  onDateChange,
  onEmployeeChange,
  onStatusChange,
  actions,
}: AttendanceFiltersProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: "wrap",
        alignItems: { sm: "center" },
        gap: 2,
        mb: 2,
      }}
    >
      <TextField
        type="date"
        label="Date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        sx={{ width: { xs: "100%", sm: 190 } }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        select
        label="Employee"
        value={employeeId}
        onChange={(e) => onEmployeeChange(e.target.value)}
        disabled={employeesLoading}
        sx={{ width: { xs: "100%", sm: 240 } }}
      >
        <MenuItem value="">All employees</MenuItem>
        {employees.map((employee) => (
          <MenuItem key={employee.id} value={employee.id}>
            {employee.name}
            {employee.employeeCode ? ` (${employee.employeeCode})` : ""}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as AttendanceStatus | "")}
        sx={{ width: { xs: "100%", sm: 200 } }}
      >
        <MenuItem value="">All statuses</MenuItem>
        {ATTENDANCE_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {actions && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            ml: { sm: "auto" },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
