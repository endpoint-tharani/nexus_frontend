import { Box, Skeleton } from "@mui/material";

export type LoadingSkeletonVariant = "table" | "card" | "form";

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant;
  /** Table body rows / form fields. */
  rows?: number;
  /** Table columns. */
  columns?: number;
  /** Number of card blocks (card variant). */
  count?: number;
}

// Uniform loading placeholders. One component, three shapes, so every screen's
// loading state matches. Drives DataTable's loading slot and form/card pages.
export default function LoadingSkeleton({
  variant = "table",
  rows = 5,
  columns = 4,
  count = 3,
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: `repeat(${Math.min(count, 4)}, 1fr)`,
          },
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="rounded" width={40} height={40} />
            <Skeleton width="55%" height={18} sx={{ mt: 2 }} />
            <Skeleton width="80%" height={32} />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === "form") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Skeleton width="30%" height={16} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ))}
        <Skeleton variant="rounded" width={140} height={40} sx={{ mt: 1 }} />
      </Box>
    );
  }

  // table
  return (
    <Box
      sx={{
        border: "none",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 2,
          p: 2,
          bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="60%" height={16} />
        ))}
      </Box>
      {/* body */}
      {Array.from({ length: rows }).map((_, r) => (
        <Box
          key={r}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 2,
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? "80%" : "50%"} height={18} />
          ))}
        </Box>
      ))}
    </Box>
  );
}
