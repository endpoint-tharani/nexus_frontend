import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface FilterBarProps {
  /** Leading slot — typically a <SearchInput>. */
  search?: ReactNode;
  /**
   * Middle filter chips / selects (department, status, year…).
   * Rendered in a flex row that wraps on smaller screens.
   */
  filters?: ReactNode;
  /** Trailing slot — export button, bulk actions, etc. */
  actions?: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Horizontal filter bar used at the top of every list screen.
 * Provides a consistent layout: search | filters | actions.
 *
 * Each slot is optional — pass only what the page needs.
 */
export default function FilterBar({ search, filters, actions, sx }: FilterBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        ...sx,
      }}
    >
      {/* Search — given a fixed min-width so it stays usable on small screens */}
      {search && (
        <Box sx={{ flexShrink: 0, minWidth: { xs: "100%", sm: 220 } }}>
          {search}
        </Box>
      )}

      {/* Filter controls — take up remaining space, wrap as needed */}
      {filters && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          {filters}
        </Box>
      )}

      {/* Trailing actions — pushed to the right on wide screens */}
      {actions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
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
