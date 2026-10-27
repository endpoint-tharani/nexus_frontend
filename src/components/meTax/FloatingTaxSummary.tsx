import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import { MoneyText, StatusChip } from "../ui";
import { TAX_REGIME_LABELS } from "../../constants/enums";
import { formatCurrency } from "../../utils/format";
import type { EmployeeStructuredDeclaration } from "../../types";

export interface FloatingTaxSummaryProps {
  declaration: EmployeeStructuredDeclaration;
}

/**
 * Sticky floating tax summary panel — enterprise redesign.
 *
 * Desktop: right-side sticky Card. White, no gradient, plain header with
 * bottom divider. Monochrome icons. Compact rows. Balance payable uses
 * a subtle semantic background.
 *
 * Mobile: compact info strip rendered above the main content.
 */
const FloatingTaxSummary = React.memo(function FloatingTaxSummary({
  declaration,
}: FloatingTaxSummaryProps) {
  const { salary, summary, regime, status } = declaration;
  const { computation } = summary;
  const monthlyTDS = computation.recommendedMonthlyTds ?? 0;

  interface Row {
    label: string;
    icon: React.ReactNode;
    value: React.ReactNode;
  }

  const rows: Row[] = [
    {
      label: "Gross Income",
      icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 15 }} />,
      value: (
        <MoneyText
          value={salary.grandTotalSalary}
          variant="body2"
          sx={{ fontWeight: 600 }}
          fractionDigits={0}
        />
      ),
    },
    {
      label: "Taxable Income",
      icon: <CalculateOutlinedIcon sx={{ fontSize: 15 }} />,
      value: (
        <MoneyText
          value={computation.taxableIncome}
          variant="body2"
          sx={{ fontWeight: 600 }}
          fractionDigits={0}
        />
      ),
    },
    {
      label: "Estimated Tax",
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 15 }} />,
      value: (
        <MoneyText
          value={computation.totalTaxPayable}
          variant="body2"
          sx={{ fontWeight: 600 }}
          fractionDigits={0}
        />
      ),
    },
    {
      label: "Monthly TDS",
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />,
      value: (
        <MoneyText
          value={monthlyTDS}
          variant="body2"
          sx={{ fontWeight: 600 }}
          fractionDigits={0}
        />
      ),
    },
    {
      label: "Regime",
      icon: <TuneOutlinedIcon sx={{ fontSize: 15 }} />,
      value: (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {TAX_REGIME_LABELS[regime] ?? regime}
        </Typography>
      ),
    },
  ];

  const balancePositive = computation.balanceTaxPayable > 0;

  return (
    <>
      {/* ── Mobile compact strip (hidden on desktop) ─────────── */}
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2.5,
          p: 1.5,
          borderRadius: "10px",
          bgcolor: "background.paper",
          border: "none",
          boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Taxable
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(computation.taxableIncome, { fractionDigits: 0 })}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Tax
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
            {formatCurrency(computation.totalTaxPayable, { fractionDigits: 0 })}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            /mo TDS
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(monthlyTDS, { fractionDigits: 0 })}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <StatusChip status={status} kind="declaration" size="small" variant="outlined" />
      </Box>

      {/* ── Desktop sticky sidebar card ───────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "10px",
          border: "none",
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
          overflow: "hidden",
          width: 268,
        }}
      >
        {/* Plain white header — no gradient */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "text.secondary",
              display: "block",
              mb: 0.125,
            }}
          >
            Tax Summary
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Live · matches admin &amp; Form 16
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <Stack divider={<Divider sx={{ borderColor: "#E5E7EB" }} />}>
            {rows.map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1,
                  transition: "background-color 120ms ease",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box
                    aria-hidden
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  >
                    {row.icon}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {row.label}
                  </Typography>
                </Box>
                {row.value}
              </Box>
            ))}

            {/* Status row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Status
              </Typography>
              <StatusChip status={status} kind="declaration" size="small" variant="outlined" />
            </Box>
          </Stack>

          {/* Balance payable highlight — subtle semantic bg */}
          <Box sx={{ px: 2.5, pb: 2, pt: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: balancePositive
                  ? "rgba(220,38,38,0.05)"
                  : "rgba(22,163,74,0.05)",
                border: "1px solid",
                borderColor: balancePositive ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.25, fontWeight: 500 }}
              >
                Balance Tax Payable
              </Typography>
              <MoneyText
                value={computation.balanceTaxPayable}
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
                color={balancePositive ? "error.main" : "success.main"}
                fractionDigits={0}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
});

export default FloatingTaxSummary;
