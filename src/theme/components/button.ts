// Button + IconButton overrides. Consistent radius, no heavy elevation, and an
// accessible focus-visible ring driven by the primary token.

import type { ThemeOptions } from "@mui/material/styles";
import { radius } from "../tokens";

export const buttonComponents: ThemeOptions["components"] = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        textTransform: "none",
        fontWeight: 600,
        boxShadow: "none",
        paddingInline: 16,
        "&:hover": { boxShadow: "none" },
        "&.Mui-focusVisible": {
          boxShadow: `0 0 0 3px ${theme.palette.primary.main}66`,
        },
      }),
      sizeSmall: { paddingBlock: 4, paddingInline: 12 },
      sizeLarge: { paddingBlock: 10, paddingInline: 22, fontSize: "0.9375rem" },
      // Contained buttons already darken to the palette `dark` shade on hover.
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.sm,
        "&.Mui-focusVisible": {
          boxShadow: `0 0 0 3px ${theme.palette.primary.main}66`,
        },
      }),
    },
  },
};
