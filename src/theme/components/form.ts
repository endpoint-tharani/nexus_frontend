// Form-control overrides: TextField, OutlinedInput, Select, labels + helper text.
// Inputs get a consistent radius, a soft default border, and a primary focus ring
// — so auth pages and forms never need per-field `sx` color hacks.

import type { ThemeOptions } from "@mui/material/styles";
import { radius } from "../tokens";

export const formComponents: ThemeOptions["components"] = {
  MuiTextField: {
    defaultProps: { size: "small", variant: "outlined" },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        backgroundColor: theme.palette.background.paper,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.divider,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.light,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
        },
        "&.Mui-focused": {
          boxShadow: `0 0 0 3px ${theme.palette.primary.main}66`,
        },
        "&.Mui-error.Mui-focused": {
          boxShadow: `0 0 0 3px ${theme.palette.error.light}55`,
        },
      }),
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary,
        "&.Mui-focused": { color: theme.palette.primary.main },
      }),
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: { marginLeft: 2, marginRight: 0 },
    },
  },
  MuiSelect: {
    defaultProps: { size: "small" },
    styleOverrides: {
      root: { borderRadius: radius.md },
    },
  },
};
