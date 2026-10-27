// Surface overrides: Card, Paper and Chip. Cards get a consistent radius + soft
// border + light shadow; Chips get a rounded, semibold, readable look.

import type { ThemeOptions } from "@mui/material/styles";
import { radius, shadowTokens } from "../tokens";

export const cardComponents: ThemeOptions["components"] = {
  MuiPaper: {
    styleOverrides: {
      // `backgroundImage: none` stops MUI's elevation gradient overlay so paper
      // surfaces stay flat-white and on-brand.
      root: { backgroundImage: "none", borderRadius: radius.lg },
      outlined: ({ theme }) => ({ borderColor: theme.palette.divider }),
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.lg,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: shadowTokens.sm,
        backgroundImage: "none",
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: radius.sm, fontWeight: 600 },
      label: { paddingInline: 10 },
      sizeSmall: { height: 22, fontSize: "0.75rem" },
    },
  },
};
