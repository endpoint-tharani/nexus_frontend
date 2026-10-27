// Data-display overrides: Table family + Tabs. Header cells become quiet, uppercase
// labels; rows get a subtle hover; tabs lose the shouty uppercase default.

import type { ThemeOptions } from "@mui/material/styles";
import { radius } from "../tokens";

export const tableComponents: ThemeOptions["components"] = {
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.background.default,
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottomColor: theme.palette.divider,
        paddingBlock: 10,
      }),
      head: ({ theme }) => ({
        fontWeight: 600,
        fontSize: "0.75rem",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.background.default,
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&:last-of-type .MuiTableCell-root": { borderBottom: "none" },
        "&.MuiTableRow-hover:hover": {
          backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : "rgba(255, 255, 255, 0.03)",
        },
      }),
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        borderRadius: "8px !important",
        overflow: "auto",
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderRadius: "8px !important",
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 44 },
      indicator: { height: 3, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: { textTransform: "none", fontWeight: 600, minHeight: 44 },
    },
  },
};
