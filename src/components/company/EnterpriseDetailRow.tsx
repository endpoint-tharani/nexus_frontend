import type { ReactNode } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";

export interface EnterpriseDetailRowProps {
  label: string;
  value?: ReactNode;
  status?: "configured" | "missing" | "not_applicable" | "pending";
  onAddClick?: () => void;
  addLabel?: string;
  copyable?: boolean;
  span?: boolean;
  subValue?: string;
}

export default function EnterpriseDetailRow({
  label,
  value,
  status,
  onAddClick,
  addLabel,
  span = false,
  subValue,
}: EnterpriseDetailRowProps) {
  const isValueEmpty = value === null || value === undefined || value === "";

  return (
    <Box
      sx={{
        gridColumn: span ? { xs: "auto", sm: "1 / -1" } : "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
        px: 1.5,
        borderRadius: "8px",
        bgcolor: "rgba(248, 250, 252, 0.6)",
        border: "1px solid #F1F5F9",
        transition: "all 0.15s ease",
        "&:hover": {
          bgcolor: "#F8FAFC",
          borderColor: "#E2E8F0",
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#64748B",
            fontWeight: 600,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "block",
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          {label}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {isValueEmpty ? (
            <Typography
              variant="body2"
              sx={{
                color: "#94A3B8",
                fontWeight: 500,
                fontSize: "13px",
                fontStyle: status === "not_applicable" ? "italic" : "normal",
              }}
            >
              {status === "not_applicable" ? "Not applicable" : "Not configured"}
            </Typography>
          ) : typeof value === "string" ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#0F172A",
                fontSize: "13.5px",
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
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "11px" }}>
              ({subValue})
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right Action / Status Badge */}
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 1 }}>
        {status === "configured" && (
          <Chip
            size="small"
            icon={<CheckCircleOutlined sx={{ fontSize: "13px !important", color: "#15803D !important" }} />}
            label="Configured"
            sx={{
              height: "22px",
              fontSize: "11px",
              fontWeight: 600,
              bgcolor: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        )}

        {status === "missing" && !onAddClick && (
          <Chip
            size="small"
            icon={<ErrorOutlineOutlined sx={{ fontSize: "13px !important", color: "#B45309 !important" }} />}
            label="Missing"
            sx={{
              height: "22px",
              fontSize: "11px",
              fontWeight: 600,
              bgcolor: "#FFFBEB",
              color: "#92400E",
              border: "1px solid #FDE68A",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        )}

        {isValueEmpty && onAddClick && (
          <Button
            size="small"
            onClick={onAddClick}
            sx={{
              height: "24px",
              px: 1.25,
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "6px",
              bgcolor: "rgba(37, 99, 235, 0.08)",
              color: "#2563EB",
              "&:hover": {
                bgcolor: "rgba(37, 99, 235, 0.16)",
              },
            }}
          >
            {addLabel || `+ Add ${label}`}
          </Button>
        )}
      </Box>
    </Box>
  );
}
