// Navigation overrides: Drawer + ListItemButton. The selected nav state is now
// theme-driven (soft primary fill + primary text) so the sidebar needs no
// hand-rolled gradient/active styling.

import type { ThemeOptions } from "@mui/material/styles";
import { radius } from "../tokens";

export const navigationComponents: ThemeOptions["components"] = {
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: "none",
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        marginBottom: 4,
        minHeight: 44,
        color: theme.palette.text.secondary,
        "&:hover": {
          backgroundColor: `${theme.palette.primary.main}0F`, // ~6% tint
        },
        "&.Mui-selected": {
          backgroundColor: `${theme.palette.primary.main}14`, // ~8% tint
          color: theme.palette.primary.main,
          fontWeight: 600,
          "&:hover": { backgroundColor: `${theme.palette.primary.main}1F` },
          "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
        },
        "&.Mui-focusVisible": {
          boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}66`,
        },
      }),
    },
  },
};
