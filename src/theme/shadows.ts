// MUI requires exactly 25 elevation slots (0–24). We map them onto the soft
// shadow tokens so elevation is consistent and brand-neutral everywhere, instead
// of MUI's default hard gray shadows.

import type { Shadows } from "@mui/material/styles";
import { shadowTokens } from "./tokens";

const { none, xs, sm, md, lg, xl } = shadowTokens;

// Ramp the 5 named tokens across the 25 elevation slots. Low elevations use the
// lighter tokens; high elevations (dialogs, menus, popovers) use the deeper ones.
export const shadows: Shadows = [
  none, //  0
  xs, //  1
  xs, //  2
  sm, //  3
  sm, //  4
  sm, //  5
  md, //  6
  md, //  7
  md, //  8
  md, //  9
  lg, // 10
  lg, // 11
  lg, // 12
  lg, // 13
  lg, // 14
  lg, // 15
  xl, // 16
  xl, // 17
  xl, // 18
  xl, // 19
  xl, // 20
  xl, // 21
  xl, // 22
  xl, // 23
  xl, // 24
] as Shadows;
