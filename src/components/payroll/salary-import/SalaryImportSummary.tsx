import { Box, Chip, Typography } from "@mui/material";
import { useSalaryImportDetails } from "../../../hooks/payroll/useSalaryImportDetails";
import { PAYROLL_UPLOAD_TYPE_LABELS } from "../../../constants/enums";
import { formatDateTime, getMonthName } from "../../../utils/format";

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 100 }}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "text.secondary",
          fontWeight: 500,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "15px",
          color: "text.primary",
          fontWeight: 600,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function SalaryImportSummary() {
  const { run, isSalary, type, parsedRemarks } = useSalaryImportDetails();

  if (!run) return null;

  const entries = run.entries ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: { xs: 2.5, md: 4 },
        p: 2, // 16px padding
        mb: 1, // 8px margin bottom
        borderRadius: "8px", // 8px border-radius
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {isSalary ? (
        <>
          <MetaItem
            label="Period"
            value={`${getMonthName(run.month)} ${run.year}`}
          />
          <MetaItem
            label="Salary Type"
            value={run.salaryType === "ARREARS" ? "Arrears Salary" : "Regular Salary"}
          />
        </>
      ) : (
        <MetaItem
          label="Financial Year"
          value={`${run.year}-${run.year + 1}`}
        />
      )}
      <MetaItem
        label="Upload Type"
        value={
          isSalary
            ? PAYROLL_UPLOAD_TYPE_LABELS[run.uploadType] ?? run.uploadType
            : type
        }
      />
      <MetaItem
        label="Status"
        value={
          <Chip
            size="small"
            label={run.status ?? "—"}
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              height: 20,
              bgcolor: "action.hover",
            }}
          />
        }
      />
      <MetaItem
        label="Uploaded At"
        value={formatDateTime(run.createdAt)}
      />
      {!isSalary && parsedRemarks && (
        <>
          <MetaItem label="File Name" value={parsedRemarks.fileName} />
          <MetaItem label="Rows Count" value={parsedRemarks.employeeCount} />
          <MetaItem label="Successful" value={parsedRemarks.successCount} />
          <MetaItem label="Skipped" value={parsedRemarks.failureCount} />
        </>
      )}
      {isSalary && (
        <MetaItem
          label="Entries"
          value={run.entryCount ?? entries.length}
        />
      )}
    </Box>
  );
}
