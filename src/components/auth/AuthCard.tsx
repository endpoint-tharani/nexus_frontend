import { Paper } from "@mui/material";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "480px",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: { xs: 3, sm: 5 }, // 40px padding on sm up, 24px on mobile
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        boxSizing: "border-box",
      }}
    >
      {children}
    </Paper>
  );
}
