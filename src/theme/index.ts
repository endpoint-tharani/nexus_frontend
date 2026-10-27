// =============================================================================
// THEME — the single styling source for the app.
//
// Assembled from the modular token / palette / typography / shadow / component
// layers. `main.tsx` imports `{ theme }` from here and feeds it to ThemeProvider.
// Tokens are re-exported so non-component code (e.g. the toast styling in
// main.tsx) can read brand values without reaching for a hex literal.
// =============================================================================

import { createTheme } from "@mui/material/styles";
import { getPalette } from "./palette";
import { typography } from "./typography";
import { shadows } from "./shadows";
import { components } from "./components";
import { radius, zLayers } from "./tokens";

export function getTheme(mode: "light" | "dark" | "auronox") {
  return createTheme({
    palette: getPalette(mode),
    typography,
    shadows,
    shape: { borderRadius: radius.md },
    zIndex: {
      appBar: zLayers.appBar,
      drawer: zLayers.drawer,
      modal: zLayers.modal,
      snackbar: zLayers.snackbar,
      tooltip: zLayers.tooltip,
    },
    components,
  });
}

// Default static theme for backward compatibility
export const theme = getTheme("light");

// Re-export the raw tokens so they can be consumed anywhere via `from "../theme"`.
export * from "./tokens";

export default theme;
