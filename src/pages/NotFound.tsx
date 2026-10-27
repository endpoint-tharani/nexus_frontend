import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { MdHome } from "react-icons/md";

interface NotFoundProps {
  // `embedded` renders inside the dashboard shell (no full-viewport canvas),
  // used by the nested catch-all route so the sidebar/topbar stay visible.
  embedded?: boolean;
}

// 404 page for unknown routes. Linked from the catch-all routes in AppRoutes.
export default function NotFound({ embedded = false }: NotFoundProps) {
  return (
    <Box
      sx={{
        minHeight: embedded ? "50vh" : "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        p: 3,
        bgcolor: embedded ? "transparent" : "background.default",
      }}
    >
      <Typography
        component="p"
        color="primary"
        sx={{
          fontWeight: 800,
          fontSize: { xs: 72, sm: 104 },
          lineHeight: 1,
        }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you're looking for doesn't exist or may have been moved.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        startIcon={<MdHome />}
        sx={{ mt: 1 }}
      >
        Back to dashboard
      </Button>
    </Box>
  );
}
