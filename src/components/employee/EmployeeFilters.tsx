import type { ReactNode } from "react";
import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import { MdSearch } from "react-icons/md";

import { EMPLOYEE_STATUS_OPTIONS } from "../../constants/enums";
import type { EmployeeStatus } from "../../constants/enums";
import type { Department } from "../../types";

export interface EmployeeFiltersProps {
  search: string;
  departmentId: string;
  status: EmployeeStatus | "";
  departments: Department[];
  departmentsLoading?: boolean;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: EmployeeStatus | "") => void;
  // Optional trailing controls (e.g. page actions) shown right-aligned on the
  // same row as the filters, so the toolbar stays a single line.
  actions?: ReactNode;
}

// Fully controlled filter bar. Holds no state of its own — every value and
// change handler is owned by the page so the active company's query key stays
// the single source of truth.
export default function EmployeeFilters({
  search,
  departmentId,
  status,
  departments,
  departmentsLoading = false,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  actions,
}: EmployeeFiltersProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: 1.5,
        mb: 2,
        width: "100%",
        overflowX: "auto",
        py: 0.5,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <TextField
        placeholder="Search employees..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: { xs: 180, sm: 200, md: 240 }, flexShrink: 0 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch size={18} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        label="Department"
        value={departmentId}
        onChange={(e) => onDepartmentChange(e.target.value)}
        disabled={departmentsLoading}
        sx={{ width: { xs: 140, sm: 160, md: 180 }, flexShrink: 0 }}
      >
        <MenuItem value="">All departments</MenuItem>
        {departments.map((department) => (
          <MenuItem key={department.id} value={department.id}>
            {department.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as EmployeeStatus | "")}
        sx={{ width: { xs: 130, sm: 140, md: 160 }, flexShrink: 0 }}
      >
        <MenuItem value="">All statuses</MenuItem>
        {EMPLOYEE_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {actions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 1,
            ml: "auto",
            flexShrink: 0,
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
