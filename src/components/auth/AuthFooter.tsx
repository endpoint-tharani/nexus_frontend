import { Box, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AuthFooterProps {
  prompt: string;
  actionLabel: string;
  actionTo: string;
}

export default function AuthFooter({ prompt, actionLabel, actionTo }: AuthFooterProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: "15px",
          color: "#6B7280",
          textAlign: "center",
          fontWeight: 400,
        }}
      >
        {prompt}{" "}
        <Link
          component={RouterLink}
          to={actionTo}
          underline="hover"
          sx={{
            color: "#2563EB",
            fontWeight: 600,
            "&:hover": {
              color: "#1D4ED8",
            },
          }}
        >
          {actionLabel}
        </Link>
      </Typography>
    </Box>
  );
}
