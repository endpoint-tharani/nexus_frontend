import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Box } from "@mui/material";
import ErrorState from "./ErrorState";

export interface ErrorBoundaryProps {
  children: ReactNode;
  // Optional custom fallback; defaults to a recoverable ErrorState.
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// App-level boundary for render-time errors React Query can't catch. Shows a
// recoverable "Unknown error" UI and lets the user reset without a full reload.
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Diagnostics hook — a production build would forward this to a monitor.
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
          <Box sx={{ maxWidth: 560, width: "100%", mt: { xs: 4, md: 10 } }}>
            <ErrorState
              title="Something went wrong"
              message={
                this.state.error.message ||
                "An unexpected error occurred while rendering this page."
              }
              onRetry={this.handleReset}
              retryLabel="Try again"
            />
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}
