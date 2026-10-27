import type { ReactNode } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { MdSearch } from "react-icons/md";

import { SHIFT_TYPE_OPTIONS } from "../../constants/enums";
import type { ShiftType } from "../../constants/enums";
import type { Branch } from "../../types";

export interface ShiftFiltersProps {
  search: string;
  type: ShiftType | "";
  branchId: string;
  includeInactive: boolean;
  branches: Branch[];
  branchesLoading?: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: ShiftType | "") => void;
  onBranchChange: (value: string) => void;
  onIncludeInactiveChange: (value: boolean) => void;
  actions?: ReactNode;
}

// Fully controlled filter bar for the shift list. Holds no state of its own so
// the query key stays the single source of truth (server pagination/search).
export default function ShiftFilters({
  search,
  type,
  branchId,
  includeInactive,
  branches,
  branchesLoading = false,
  onSearchChange,
  onTypeChange,
  onBranchChange,
  onIncludeInactiveChange,
  actions,
}: ShiftFiltersProps) {
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
        label="Search"
        placeholder="Name or code"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: { xs: "100%", sm: 240 } }}
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
        label="Type"
        value={type}
        onChange={(e) => onTypeChange(e.target.value as ShiftType | "")}
        sx={{ width: { xs: "100%", sm: 180 } }}
      >
        <MenuItem value="">All types</MenuItem>
        {SHIFT_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Branch"
        value={branchId}
        onChange={(e) => onBranchChange(e.target.value)}
        disabled={branchesLoading}
        sx={{ width: { xs: "100%", sm: 200 } }}
      >
        <MenuItem value="">All branches</MenuItem>
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.name}
          </MenuItem>
        ))}
      </TextField>

      <FormControlLabel
        control={
          <Checkbox
            checked={includeInactive}
            onChange={(e) => onIncludeInactiveChange(e.target.checked)}
          />
        }
        label="Show inactive"
      />

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
