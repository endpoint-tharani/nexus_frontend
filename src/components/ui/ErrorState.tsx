import type { ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import { MdErrorOutline, MdRefresh } from "react-icons/md";

// Canonical error surface for failed queries, boundaries and DataTable's error
// slot. `role="alert"` + `aria-live` announce it to assistive tech on mount.
//
// Props are a superset of the legacy `common/ErrorState` API (`message`/`onRetry`)
// AND the design-system API (`description`) so the old component can simply
// re-export this one — no duplicated implementation.
export interface ErrorStateProps {
  title?: string;
  /** Preferred prop. `message` is kept as a backwards-compatible alias. */
  description?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  dense?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  description,
  message,
  error,
  onRetry,
  retryLabel = "Try again",
  icon,
  dense = false,
}: ErrorStateProps) {
  let displayTitle = title;
  let displayDescription = description ?? message ?? "An unexpected error occurred. Please try again.";

  if (error && typeof error === "object") {
    const responseStatus =
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response &&
      typeof error.response.status === "number"
        ? error.response.status
        : undefined;
    const status =
      "status" in error && typeof error.status === "number"
        ? error.status
        : responseStatus;
    if (status === 403) {
      displayTitle = "Access Denied";
      displayDescription = "Your account does not have access to this organization resource.";
    }
  }

  return (
    <Box
      role="alert"
      aria-live="assertive"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.25,
        px: 3,
        py: dense ? 4 : 7,
      }}
    >
      <Box aria-hidden sx={{ color: "error.main", display: "flex", fontSize: 0 }}>
        {icon ?? <MdErrorOutline size={44} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {displayTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
        {displayDescription}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<MdRefresh />}
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
}
