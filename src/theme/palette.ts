import type { PaletteOptions } from "@mui/material/styles";
import { brand, semantic, neutral, lightSurface, darkSurface, auronoxSurface } from "./tokens";

const greyScale = {
  50: neutral[50],
  100: neutral[100],
  200: neutral[200],
  300: neutral[300],
  400: neutral[400],
  500: neutral[500],
  600: neutral[600],
  700: neutral[700],
  800: neutral[800],
  900: neutral[900],
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: brand.primary,
  secondary: brand.secondary,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
  grey: greyScale,
  background: {
    default: lightSurface.background,
    paper: lightSurface.paper,
  },
  text: {
    primary: lightSurface.text.primary,
    secondary: lightSurface.text.secondary,
    disabled: lightSurface.text.disabled,
  },
  divider: lightSurface.divider,
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#10B981", // emerald-500 (emerald green accent from screenshot)
    light: "#34D399",
    dark: "#059669",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#3B82F6", // blue-500
    light: "#60A5FA",
    dark: "#1D4ED8",
    contrastText: "#FFFFFF",
  },
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
  grey: greyScale,
  background: {
    default: darkSurface.background,
    paper: darkSurface.paper,
  },
  text: {
    primary: darkSurface.text.primary,
    secondary: darkSurface.text.secondary,
    disabled: darkSurface.text.disabled,
  },
  divider: darkSurface.divider,
};

export const auronoxPalette: PaletteOptions = {
  mode: "dark", // behaves as a dark theme for MUI components
  primary: {
    main: "#8B5CF6", // violet-500 / Auronox signature color
    light: "#A78BFA",
    dark: "#5B21B6",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#EC4899", // pink accent
    light: "#F472B6",
    dark: "#DB2777",
    contrastText: "#FFFFFF",
  },
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
  grey: greyScale,
  background: {
    default: auronoxSurface.background,
    paper: auronoxSurface.paper,
  },
  text: {
    primary: auronoxSurface.text.primary,
    secondary: auronoxSurface.text.secondary,
    disabled: auronoxSurface.text.disabled,
  },
  divider: auronoxSurface.divider,
};

export function getPalette(mode: "light" | "dark" | "auronox"): PaletteOptions {
  switch (mode) {
    case "dark":
      return darkPalette;
    case "auronox":
      return auronoxPalette;
    case "light":
    default:
      return lightPalette;
  }
}
