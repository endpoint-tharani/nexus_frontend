import type { ReactNode } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";

export interface DetailItemProps {
  label: string;
  value?: ReactNode;
  status?: "missing" | "configured" | "active" | "inactive" | "enabled" | "disabled" | "pending";
  onAddClick?: () => void;
  addLabel?: string;
  subValue?: string;
}

export default function DetailItem({
  label,
  value,
  status,
  onAddClick,
  addLabel,
  subValue,
}: DetailItemProps) {
  const isValueEmpty = value === null || value === undefined || value === "";

  return (
    <Box sx={{ minWidth: 0, py: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
          fontSize: "12px",
          display: "block",
          lineHeight: 1.3,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", minHeight: "22px" }}>
        {isValueEmpty ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "14px", fontWeight: 500 }}>
              Not configured
            </Typography>

            {onAddClick && (
              <Button
                size="small"
                onClick={onAddClick}
                sx={{
                  p: 0,
                  minWidth: 0,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "primary.main",
                  textTransform: "none",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                {addLabel || "+ Add"}
              </Button>
            )}
          </Box>
        ) : typeof value === "string" ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              fontSize: "14px",
              lineHeight: 1.4,
              fontFamily: label.includes("PAN") || label.includes("TAN") || label.includes("GSTIN") ? "monospace" : "inherit",
              letterSpacing: label.includes("PAN") || label.includes("TAN") ? "0.03em" : "normal",
            }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}

        {subValue && (
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px" }}>
            ({subValue})
          </Typography>
        )}

        {status === "configured" && (
          <Chip
            size="small"
            label="Configured"
            sx={{
              height: "20px",
              fontSize: "10.5px",
              fontWeight: 600,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(22, 101, 52, 0.25)" : "#F0FDF4"),
              color: (theme) => (theme.palette.mode === "dark" ? "#4ADE80" : "#166534"),
              border: "1px solid",
              borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(74, 222, 128, 0.3)" : "#BBF7D0"),
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        )}

        {status === "missing" && !onAddClick && (
          <Chip
            size="small"
            label="Missing"
            sx={{
              height: "20px",
              fontSize: "10.5px",
              fontWeight: 600,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(180, 83, 9, 0.25)" : "#FFFBEB"),
              color: (theme) => (theme.palette.mode === "dark" ? "#FBBF24" : "#92400E"),
              border: "1px solid",
              borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(251, 191, 36, 0.3)" : "#FDE68A"),
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
