import { Box, Button, Paper, Typography } from "@mui/material";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import type { Company } from "../../types";

interface CompanySetupAlertProps {
  company: Company;
  onFixClick?: () => void;
}

export default function CompanySetupAlert({ company, onFixClick }: CompanySetupAlertProps) {
  const missingItems: string[] = [];
  if (!company.pan) missingItems.push("Company PAN");
  if (!company.tan) missingItems.push("Company TAN");
  if (!company.responsiblePerson?.pan) missingItems.push("Responsible Person PAN");
  if (!company.address) missingItems.push("Registered Address");

  // If everything is configured, render NOTHING.
  if (missingItems.length === 0) {
    return null;
  }

  const missingText = missingItems.join(" and ") + " need to be configured for full TDS compliance.";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        px: 2.5,
        borderRadius: "8px",
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(217, 119, 6, 0.15)" : "#FFFBEB"),
        border: "1px solid",
        borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(217, 119, 6, 0.35)" : "#FDE68A"),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
        <WarningAmberOutlined
          sx={{
            fontSize: 20,
            color: (theme) => (theme.palette.mode === "dark" ? "#FBBF24" : "#D97706"),
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: (theme) => (theme.palette.mode === "dark" ? "#FDE68A" : "#92400E"),
              fontSize: "13.5px",
            }}
          >
            Company setup incomplete
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => (theme.palette.mode === "dark" ? "#FCD34D" : "#B45309"),
              fontSize: "13px",
            }}
          >
            {missingText}
          </Typography>
        </Box>
      </Box>

      {onFixClick && (
        <Button
          size="small"
          onClick={onFixClick}
          sx={{
            height: "32px",
            px: 2,
            fontSize: "12.5px",
            fontWeight: 600,
            color: (theme) => (theme.palette.mode === "dark" ? "#FDE68A" : "#92400E"),
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(217, 119, 6, 0.3)" : "#FEF3C7"),
            borderRadius: "6px",
            textTransform: "none",
            flexShrink: 0,
            "&:hover": {
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(217, 119, 6, 0.45)" : "#FDE68A"),
            },
          }}
        >
          Complete Setup
        </Button>
      )}
    </Paper>
  );
}
