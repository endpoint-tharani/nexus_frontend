import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";

import { MoneyText } from "../ui";
import type { StructuredSummary } from "../../types";

export interface TaxSummaryCardProps {
  summary: StructuredSummary;
}

// ─────────────────────────────────────────────────────────────────
// Internal primitive: a single label → amount row
// ─────────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  bold,
  muted,
  negativeOk,
  indent,
}: {
  label: string;
  value: number | null | undefined;
  bold?: boolean;
  muted?: boolean;
  negativeOk?: boolean;
  indent?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
        pl: indent ? 2.5 : 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {indent && (
          <ArrowRightOutlinedIcon
            sx={{ fontSize: 14, opacity: 0.35, flexShrink: 0, color: "text.secondary" }}
          />
        )}
        <Typography
          variant={bold ? "subtitle2" : "body2"}
          color={muted ? "text.secondary" : "text.primary"}
          sx={{ fontWeight: bold ? 600 : 400 }}
        >
          {label}
        </Typography>
      </Box>
      <MoneyText
        value={value}
        variant={bold ? "subtitle2" : "body2"}
        sx={{ fontWeight: bold ? 600 : 500 }}
        color={negativeOk && (value ?? 0) < 0 ? "error.main" : undefined}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section sub-heading inside the card
// ─────────────────────────────────────────────────────────────────
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        fontWeight: 600,
        letterSpacing: "0.09em",
        color: "text.secondary",
        mt: 1.5,
        mb: 0.25,
      }}
    >
      {children}
    </Typography>
  );
}

/**
 * Unified tax summary card — enterprise redesign.
 * Header: plain icon (no color circle) + title/subtitle.
 * Content: unchanged computation rows. Balance payable keeps semantic colors.
 */
const TaxSummaryCard = React.memo(function TaxSummaryCard({
  summary,
}: TaxSummaryCardProps) {
  const { income, deductions, computation } = summary;
  const allowedChapterVIA = deductions.chapterVIA.filter((l) => l.allowed > 0);

  return (
    <Card
      elevation={0}
      sx={{
        border: "none",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header — no colored circle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
            flexShrink: 0,
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            Tax Computation Summary
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Backend-computed · matches admin view &amp; Form 16
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={0}>
          {/* ── Income from Salary ─────────────────────────────── */}
          <SubHeading>Income from Salary</SubHeading>
          <Row label="Gross Salary" value={income.grossSalary} />
          <Row
            label="Less: HRA Exemption"
            value={-deductions.hraExemption}
            muted
            indent
          />
          <Row
            label="Less: Standard Deduction"
            value={-deductions.standardDeduction}
            muted
            indent
          />
          <Row
            label="Less: Professional Tax"
            value={-deductions.professionalTax}
            muted
            indent
          />
          {computation.employeePfFromPayroll && computation.employeePfFromPayroll > 0 ? (
            <Row
              label="Less: Employee PF (Payroll)"
              value={-computation.employeePfFromPayroll}
              muted
              indent
            />
          ) : null}
          <Row
            label="Income from Salary"
            value={income.incomeFromSalary}
            bold
          />

          <Divider sx={{ my: 1.25 }} />

          {/* ── Income Summary ─────────────────────────────────── */}
          <SubHeading>Total Income</SubHeading>
          <Row label="Income from Salary" value={income.incomeFromSalary} />
          {income.houseProperty !== 0 && (
            <Row
              label="House Property"
              value={income.houseProperty}
              negativeOk
            />
          )}
          {income.otherSources > 0 && (
            <Row label="Other Sources" value={income.otherSources} />
          )}
          <Row
            label="Gross Total Income"
            value={income.grossTotalIncome}
            bold
          />

          <Divider sx={{ my: 1.25 }} />

          {/* ── Deductions ─────────────────────────────────────── */}
          <SubHeading>Deductions Applied</SubHeading>
          {deductions.standardDeduction > 0 && (
            <Row
              label="Standard Deduction"
              value={deductions.standardDeduction}
            />
          )}
          {deductions.hraExemption > 0 && (
            <Row label="HRA Exemption" value={deductions.hraExemption} />
          )}
          {deductions.professionalTax > 0 && (
            <Row
              label="Professional Tax"
              value={deductions.professionalTax}
            />
          )}
          {deductions.homeLoanInterest > 0 && (
            <Row
              label="Home Loan Interest"
              value={deductions.homeLoanInterest}
            />
          )}
          {allowedChapterVIA.map((line) => (
            <Row key={line.code} label={line.label} value={line.allowed} />
          ))}
          {deductions.chapterVIATotal > 0 && (
            <Row
              label="Total Chapter VI-A"
              value={deductions.chapterVIATotal}
              bold
            />
          )}

          <Divider sx={{ my: 1.25 }} />

          {/* ── Tax Computation ────────────────────────────────── */}
          <SubHeading>Tax Computation</SubHeading>
          <Row
            label="Gross Total Income"
            value={computation.grossTotalIncome}
          />
          <Row
            label="Taxable Income"
            value={computation.taxableIncome}
            bold
          />
          <Row
            label="Tax Before Rebate"
            value={computation.taxBeforeRebate}
          />
          {computation.rebate87A > 0 && (
            <Row
              label="Less: Rebate u/s 87A"
              value={-computation.rebate87A}
              muted
              indent
            />
          )}
          {computation.surcharge > 0 && (
            <Row label="Surcharge" value={computation.surcharge} />
          )}
          {computation.cess > 0 && (
            <Row label="Health & Education Cess" value={computation.cess} />
          )}

          <Divider sx={{ my: 1 }} />

          <Row
            label="Total Tax Payable"
            value={computation.totalTaxPayable}
            bold
          />
          <Row
            label="Less: TDS Deducted"
            value={-computation.tdsDeducted}
            muted
            indent
          />

          {/* Balance payable — highlighted */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1.5,
              px: 2,
              py: 1,
              borderRadius: "8px",
              bgcolor:
                computation.balanceTaxPayable > 0
                  ? "rgba(220,38,38,0.05)"
                  : "rgba(22,163,74,0.05)",
              border: "1px solid",
              borderColor:
                computation.balanceTaxPayable > 0
                  ? "rgba(220,38,38,0.2)"
                  : "rgba(22,163,74,0.2)",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Balance Tax Payable
            </Typography>
            <MoneyText
              value={computation.balanceTaxPayable}
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
              color={
                computation.balanceTaxPayable > 0
                  ? "error.main"
                  : "success.main"
              }
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

export default TaxSummaryCard;
