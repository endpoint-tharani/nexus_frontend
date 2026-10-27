import { Box } from "@mui/material";

export interface LogoProps {
  /** Height of the logo in px. The wordmark lockup scales its width from this. */
  size?: number;
  /** Render the geometric mark alone (square), without the "auronox" wordmark. */
  markOnly?: boolean;
  /** Use the white-wordmark lockup, for placement on dark surfaces. */
  onDark?: boolean;
}

// Aspect ratio of the full brand lockups shipped in /public (1240 × 254).
const LOCKUP_RATIO = 1240 / 254;

// Auronox brand lockup. Renders the official artwork from /public so the brand is
// pixel-identical everywhere:
//   • full lockup → logo.png (dark wordmark) or logo-dark.png (white wordmark)
//   • mark only   → logo-mark.png, the standalone geometric "A" cropped from the lockup
// Self-contained and theme-agnostic, so it can sit on any surface across the app.
export default function Logo({ size = 34, markOnly = false, onDark = false }: LogoProps) {
  if (markOnly) {
    return (
      <Box
        component="img"
        src="/logo-mark.png"
        alt="Auronox"
        sx={{ width: size, height: size, display: "block" }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={onDark ? "/logo-dark.png" : "/logo.png"}
      alt="Auronox"
      sx={{ height: size, width: size * LOCKUP_RATIO, display: "block" }}
    />
  );
}
