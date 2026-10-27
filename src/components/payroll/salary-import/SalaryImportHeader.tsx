import { Box, Button, Typography, Divider, Chip } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import { useSalaryImportDetails } from "../../../hooks/payroll/useSalaryImportDetails";
import SalaryImportFilters from "./SalaryImportFilters";

export interface SalaryImportHeaderProps {
  onBack: () => void;
}

export default function SalaryImportHeader({ onBack }: SalaryImportHeaderProps) {
  const { type, filteredEntries, run } = useSalaryImportDetails();
  const count = filteredEntries?.length ?? run?.entries?.length ?? 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 0,
        mb: 1.5,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Button
          onClick={onBack}
          startIcon={<MdArrowBack />}
          size="small"
          sx={{
            textTransform: "none",
            color: "text.secondary",
            fontSize: "14px",
            fontWeight: 500,
            p: "4px 8px",
            minWidth: "auto",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          Back
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, alignSelf: "center" }} />
        <Typography
          variant="h6"
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          {type === "SALARY"
            ? "Salary Import Details"
            : type === "BONUS"
            ? "Bonus Import Details"
            : "Incentive Import Details"}
        </Typography>
        <Chip
          label={`${count} entries`}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: "12px",
            height: 22,
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        />
      </Box>

      <SalaryImportFilters />
    </Box>
  );
}
