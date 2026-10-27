// Overlay + feedback overrides: Dialog, Tooltip, Snackbar, Alert. Grouped here
// because they're all transient surfaces layered above the page.

import type { ThemeOptions } from "@mui/material/styles";
import { radius, neutral } from "../tokens";

export const dialogComponents: ThemeOptions["components"] = {
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: radius.xl,
        backgroundImage: "none",
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: { fontSize: "1.125rem", fontWeight: 700, paddingBottom: 8 },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: neutral[800],
        borderRadius: radius.sm,
        fontSize: "0.75rem",
        fontWeight: 500,
        paddingBlock: 6,
        paddingInline: 10,
      },
      arrow: { color: neutral[800] },
    },
  },
  MuiSnackbarContent: {
    styleOverrides: {
      root: { borderRadius: radius.md },
    },
  },
  MuiAlert: {
    defaultProps: { variant: "standard" },
    styleOverrides: {
      root: { borderRadius: radius.md, alignItems: "center" },
      message: { fontSize: "0.875rem" },
    },
  },
};
