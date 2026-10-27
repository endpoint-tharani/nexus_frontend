// MUI typography scale built from the font tokens. One font family (Inter),
// a clear h1–h6 + body + caption + button ramp, and `none` text-transform on
// buttons (set globally so no page needs to override it).

import type { ThemeOptions } from "@mui/material/styles";
import { fontFamily, fontWeight } from "./tokens";

export const typography: ThemeOptions["typography"] = {
  fontFamily,
  fontWeightLight: fontWeight.regular,
  fontWeightRegular: fontWeight.regular,
  fontWeightMedium: fontWeight.medium,
  fontWeightBold: fontWeight.bold,

  h1: { fontSize: "2rem", fontWeight: fontWeight.extrabold, lineHeight: 1.2, letterSpacing: "-0.02em" },
  h2: { fontSize: "1.75rem", fontWeight: fontWeight.extrabold, lineHeight: 1.25, letterSpacing: "-0.02em" },
  h3: { fontSize: "1.5rem", fontWeight: fontWeight.bold, lineHeight: 1.3, letterSpacing: "-0.01em" },
  h4: { fontSize: "1.25rem", fontWeight: fontWeight.bold, lineHeight: 1.3, letterSpacing: "-0.01em" },
  h5: { fontSize: "1.1rem", fontWeight: fontWeight.bold, lineHeight: 1.4 },
  h6: { fontSize: "1rem", fontWeight: fontWeight.semibold, lineHeight: 1.4 },

  subtitle1: { fontSize: "0.875rem", fontWeight: fontWeight.semibold, lineHeight: 1.5 },
  subtitle2: { fontSize: "0.8125rem", fontWeight: fontWeight.semibold, lineHeight: 1.5 },

  body1: { fontSize: "0.875rem", fontWeight: fontWeight.regular, lineHeight: 1.6 },
  body2: { fontSize: "0.8125rem", fontWeight: fontWeight.regular, lineHeight: 1.55 },

  caption: { fontSize: "0.75rem", fontWeight: fontWeight.regular, lineHeight: 1.5 },
  overline: {
    fontSize: "0.6875rem",
    fontWeight: fontWeight.semibold,
    lineHeight: 1.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: fontWeight.semibold,
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    textTransform: "none",
  },
};
