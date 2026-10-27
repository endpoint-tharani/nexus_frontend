import type { ReactNode } from "react";
import { Box, Button, Card } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { MdRocketLaunch, MdArrowForward } from "react-icons/md";
import { EmptyState } from "../../components/ui";

export interface ModulePlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Optional accent for the icon badge. */
  color?: "primary" | "secondary" | "info" | "success" | "warning";
}

// Honest stand-in for a purchased-but-not-yet-built module. The module IS enabled
// (the registry routed us here), so we frame it as "coming soon" rather than a
// permission error. Composed from the shared design-system primitives.
export default function ModulePlaceholder({
  title,
  description,
  icon,
  color = "primary",
}: ModulePlaceholderProps) {
  return (
    <Card sx={{ p: { xs: 2, md: 4 } }}>
      <EmptyState
        icon={
          <Box
            aria-hidden
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: `${color}.main`,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
            }}
          >
            {icon ?? <MdRocketLaunch size={32} />}
          </Box>
        }
        title={title}
        description={
          description ??
          "This module is active on your plan. The full experience is being rolled out — check back shortly."
        }
        action={
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            endIcon={<MdArrowForward size={16} />}
          >
            Back to dashboard
          </Button>
        }
      />
    </Card>
  );
}
