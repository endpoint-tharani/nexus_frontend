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
        bgcolor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        p: { xs: 3, sm: 5 }, // 40px padding on sm up, 24px on mobile
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
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
