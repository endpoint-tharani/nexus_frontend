import { Box, CircularProgress, Typography } from "@mui/material";

export interface LoadingFallbackProps {
  label?: string;
  minHeight?: number | string;
}

// Suspense fallback for lazily-loaded routes. Announced politely to screen
// readers via role="status" / aria-busy so a route swap isn't silent.
export default function LoadingFallback({
  label = "Loading…",
  minHeight = "60vh",
}: LoadingFallbackProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress aria-hidden />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
