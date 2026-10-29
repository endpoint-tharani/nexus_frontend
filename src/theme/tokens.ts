// =============================================================================
// DESIGN TOKENS — single source of truth for the whole visual language.
//
// These are RAW, framework-agnostic values. The MUI theme (palette / typography /
// shadows / component overrides) is built ON TOP of these tokens, never the other
// way round. Anything visual — a color, a radius, a spacing step — should trace
// back to a token here. Pages must never hardcode a hex value.
//
// Structured so a dark theme can later be added by swapping `lightSurface` for a
// `darkSurface` set and re-deriving the palette; the brand + semantic + neutral
// scales stay identical across modes.
// =============================================================================

// -----------------------------------------------------------------------------
// Brand palette — resolves the historical purple-vs-teal split into ONE language.
//   Primary  = blue  (#2563EB)  — actions, links, active nav, focus rings.
//   Secondary = violet (#7C3AED) — accents, highlights, secondary actions.
// -----------------------------------------------------------------------------
export const brand = {
  primary: {
    main: "#2563EB",
    light: "#60A5FA",
    dark: "#1D4ED8",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#7C3AED",
    light: "#A78BFA",
    dark: "#6D28D9",
    contrastText: "#FFFFFF",
  },
  // Auronox signature purple — matches the wordmark + the geometric mark in
  // `public/favicon.svg`. Not part of the default MUI palette; the auth surface
  // promotes it to `primary` via a scoped theme so the brand front-door reads
  // purple while the dashboard keeps the blue `primary` above.
  auronox: {
    main: "#6D28D9",
    light: "#8B5CF6",
    dark: "#5B21B6",
    contrastText: "#FFFFFF",
  },
} as const;

// -----------------------------------------------------------------------------
// Semantic palette — status / feedback colors.
// -----------------------------------------------------------------------------
export const semantic = {
  success: { main: "#16A34A", light: "#4ADE80", dark: "#15803D", contrastText: "#FFFFFF" },
  warning: { main: "#D97706", light: "#FBBF24", dark: "#B45309", contrastText: "#FFFFFF" },
  error: { main: "#DC2626", light: "#F87171", dark: "#B91C1C", contrastText: "#FFFFFF" },
  info: { main: "#0284C7", light: "#38BDF8", dark: "#0369A1", contrastText: "#FFFFFF" },
} as const;

// -----------------------------------------------------------------------------
// Neutral / gray scale (slate). Drives text, borders, dividers, muted surfaces.
// -----------------------------------------------------------------------------
export const neutral = {
  0: "#FFFFFF",
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
} as const;

// -----------------------------------------------------------------------------
// Light-mode surfaces + text + borders, derived from the neutral scale.
// (Group these so a `darkSurface` sibling can later flip the whole app.)
// -----------------------------------------------------------------------------
export const lightSurface = {
  background: "#F7F8FA", // app canvas
  paper: "#FFFFFF", // cards, sheets, menus
  subtle: neutral[100], // muted fills (inputs, hover rows)
  text: {
    primary: neutral[900],
    secondary: neutral[500],
    disabled: neutral[400],
  },
  divider: "rgba(15, 23, 42, 0.10)", // slate-900 @ 10%
  border: "rgba(15, 23, 42, 0.12)",
  focusRing: "rgba(37, 99, 235, 0.40)", // primary @ 40%
} as const;

// -----------------------------------------------------------------------------
// Dark-mode surfaces + text + borders.
// -----------------------------------------------------------------------------
export const darkSurface = {
  background: "#121212", // pitch black canvas (matching user's screenshot)
  paper: "#1E1E1E", // charcoal card background (matching user's screenshot)
  subtle: "#2A2A2A", // subtle hover/inputs
  text: {
    primary: "#F3F4F6", // grey-100
    secondary: "#9CA3AF", // grey-400
    disabled: "#6B7280", // grey-500
  },
  divider: "rgba(255, 255, 255, 0.05)", // softened divider (matching user's screenshot)
  border: "rgba(255, 255, 255, 0.05)", // softened border (matching user's screenshot)
  focusRing: "rgba(16, 185, 129, 0.40)", // primary green @ 40%
} as const;

// -----------------------------------------------------------------------------
// Midnight Purple (Auronox Brand) surfaces + text + borders.
// -----------------------------------------------------------------------------
export const auronoxSurface = {
  background: "#070412", // extreme deep midnight blue-purple app canvas
  paper: "#0F0A26", // rich purple cards
  subtle: "#1B133E", // violet-900 / dark purple subtle hover/inputs
  text: {
    primary: "#F5F3FF", // violet-50
    secondary: "#C084FC", // violet-400 light purple-pink text
    disabled: "#7C3AED", // violet-600 muted text
  },
  divider: "rgba(139, 92, 246, 0.12)", // softened divider
  border: "rgba(139, 92, 246, 0.15)", // softened border
  focusRing: "rgba(139, 92, 246, 0.40)", // purple focus ring @ 40%
} as const;


// -----------------------------------------------------------------------------
// Spacing scale (px). MUI's spacing() stays an 8px grid; these are the explicit
// design steps used directly (e.g. gaps, paddings) when a raw px value is needed.
// -----------------------------------------------------------------------------
export const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48] as const;
export type SpacingStep = (typeof spacing)[number];

// -----------------------------------------------------------------------------
// Border-radius tokens. `md` is the global default (theme.shape.borderRadius).
// -----------------------------------------------------------------------------
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// -----------------------------------------------------------------------------
// Elevation / shadow tokens — soft, low-contrast, brand-neutral.
// The full 25-slot MUI shadows array is assembled from these in `shadows.ts`.
// -----------------------------------------------------------------------------
export const shadowTokens = {
  none: "none",
  xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
  sm: "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
  md: "0 4px 12px rgba(15, 23, 42, 0.08)",
  lg: "0 12px 28px rgba(15, 23, 42, 0.10)",
  xl: "0 24px 60px rgba(15, 23, 42, 0.12)",
} as const;

// -----------------------------------------------------------------------------
// z-index layers — keeps overlay stacking intentional and conflict-free.
// -----------------------------------------------------------------------------
export const zLayers = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

// -----------------------------------------------------------------------------
// Typography tokens.
// -----------------------------------------------------------------------------
export const fontFamily = `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Layout constants shared by the app shell.
export const layout = {
  drawerFull: 248,
  drawerMini: 72,
  topbarHeight: 64,
  contentMaxWidth: 1440,
} as const;
