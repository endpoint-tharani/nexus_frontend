// Merges every component-override module into the single `components` object that
// feeds createTheme. Add a new override file and spread it here — one place.

import type { ThemeOptions } from "@mui/material/styles";
import { buttonComponents } from "./button";
import { cardComponents } from "./card";
import { dialogComponents } from "./dialog";
import { formComponents } from "./form";
import { tableComponents } from "./table";
import { navigationComponents } from "./navigation";

export const components: ThemeOptions["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        minHeight: "100vh",
      },
      // Respect users who prefer reduced motion.
      "@media (prefers-reduced-motion: reduce)": {
        "*, *::before, *::after": {
          animationDuration: "0.001ms !important",
          transitionDuration: "0.001ms !important",
        },
      },
      // Ensure all tables and their wrappers (papers, cards, containers) have slightly curved corners.
      ".MuiPaper-root:has(.MuiTable-root), .MuiCard-root:has(.MuiTable-root), .MuiPaper-root:has(table), .MuiCard-root:has(table)": {
        borderRadius: "12px",
      },
      ".MuiTableContainer-root": {
        borderRadius: "8px !important",
        overflow: "auto",
      },
      ".MuiTable-root, table": {
        borderRadius: "8px !important",
      },
    },
  },
  ...buttonComponents,
  ...cardComponents,
  ...dialogComponents,
  ...formComponents,
  ...tableComponents,
  ...navigationComponents,
};
