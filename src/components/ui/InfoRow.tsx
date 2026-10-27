import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface InfoRowProps {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  span?: boolean;
}

export default function InfoRow({ icon, label, value, span = false }: InfoRowProps) {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <Box
      sx={{
        gridColumn: span ? { xs: "auto", sm: "1 / -1" } : "auto",
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        py: 1.5,
        borderBottom: "1px solid #E5E7EB",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {icon && (
        <Box
          sx={{
            color: "#2563EB",
            mt: 0.25,
            display: "flex",
            "& svg": { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            display: "block",
            lineHeight: 1.3,
            mb: 0.25,
          }}
        >
          {label}
        </Typography>

        <Typography
          component="div"
          variant="body2"
          sx={{
            fontWeight: 500,
            wordBreak: "break-word",
            color: isEmpty ? "#94A3B8" : "#111827",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          {isEmpty ? "Not set" : value}
        </Typography>
      </Box>
    </Box>
  );
}
