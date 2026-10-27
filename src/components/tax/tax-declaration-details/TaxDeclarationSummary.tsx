import { Box, Typography, Alert } from "@mui/material";
import { DateText, StatusChip } from "../../ui";
import { DeclarationStatus, TAX_REGIME_LABELS } from "../../../constants/enums";
import type { TaxDeclaration } from "../../../types";
import { formatFinancialYear } from "../../../utils/format";

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

export interface TaxDeclarationSummaryProps {
  declaration: TaxDeclaration;
}

export default function TaxDeclarationSummary({
  declaration,
}: TaxDeclarationSummaryProps) {
  const isRejected =
    declaration.status === DeclarationStatus.REJECTED &&
    !!declaration.rejectionReason;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: 2.5, md: 4 },
          p: 2, // 16px padding
          borderRadius: "8px", // 8px border-radius
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <MetaItem
          label="Employee"
          value={
            declaration.employeeName ??
            declaration.employeeCode ??
            declaration.employeeId
          }
        />
        <MetaItem
          label="Financial Year"
          value={formatFinancialYear(declaration.year)}
        />
        <MetaItem
          label="Regime"
          value={TAX_REGIME_LABELS[declaration.regime] ?? declaration.regime}
        />
        <MetaItem
          label="Status"
          value={<StatusChip kind="declaration" status={declaration.status} />}
        />
        <MetaItem
          label="Submitted At"
          value={<DateText value={declaration.submittedAt} withTime />}
        />
        <MetaItem
          label="Reviewed At"
          value={<DateText value={declaration.reviewedAt} withTime />}
        />
      </Box>

      {/* Rejection reason */}
      {isRejected && (
        <Alert severity="error">
          <strong>Rejection reason:</strong> {declaration.rejectionReason}
        </Alert>
      )}
    </Box>
  );
}
