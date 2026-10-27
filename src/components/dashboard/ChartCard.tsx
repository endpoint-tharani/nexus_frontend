import type { ReactNode } from "react";
import { Box, Skeleton } from "@mui/material";
import { SectionCard, EmptyState, ErrorState } from "../ui";

export interface ChartCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  /** Fixed plot height so every chart card lines up. */
  height?: number;
  children: ReactNode;
}

// Standard container for a dashboard chart: a titled SectionCard that renders
// the four required states — loading (skeleton), error, empty, content — so the
// chart body itself only ever deals with real, non-empty data.
export default function ChartCard({
  title,
  subtitle,
  actions,
  loading = false,
  error = false,
  empty = false,
  emptyTitle = "No data yet",
  emptyDescription,
  onRetry,
  height = 280,
  children,
}: ChartCardProps) {
  return (
    <SectionCard title={title} subtitle={subtitle} actions={actions}>
      <Box sx={{ height }}>
        {loading ? (
          <Skeleton variant="rounded" width="100%" height={height} />
        ) : error ? (
          <ErrorState
            dense
            description="Couldn't load this chart."
            onRetry={onRetry}
          />
        ) : empty ? (
          <EmptyState dense title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </Box>
    </SectionCard>
  );
}
