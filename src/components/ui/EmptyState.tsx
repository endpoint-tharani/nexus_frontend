import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  /** Primary call-to-action, e.g. a "Create" button. */
  action?: ReactNode;
  icon?: ReactNode;
  /** Compact padding for use inside tables/cards. */
  dense?: boolean;
}

/**
 * Uniform "nothing here yet" surface. Used by DataTable's empty slot and any list
 * screen so the empty experience is consistent and never a bare blank panel.
 *
 * Icon is presented in a subtle dashed container to avoid visual heaviness.
 */
export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon,
  dense = false,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        px: 3,
        py: dense ? 4 : 8,
      }}
    >
      {/* Dashed icon container */}
      <Box
        aria-hidden
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "12px",
          border: "1.5px dashed",
          borderColor: "divider",
          color: "text.disabled",
          fontSize: 0,
          mb: 0.5,
        }}
      >
        {icon ?? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400, mt: 0.5, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action && <Box sx={{ mt: 0.5 }}>{action}</Box>}
    </Box>
  );
}
