import { Box } from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";

import { MoneyText, StatCard } from "../ui";
import type { EmployeeStructuredDeclaration } from "../../types";

export interface MyTaxSummaryCardsProps {
  declaration: EmployeeStructuredDeclaration;
}

/**
 * Five business-critical TDS KPI cards:
 *  1. Estimated Annual Tax
 *  2. TDS Deducted Till Date
 *  3. Remaining Tax
 *  4. Remaining Months (in FY)
 *  5. Recommended Monthly TDS
 *
 * All monetary values are sourced from `computation` which is built by the
 * backend tax engine. The imported TDS (from Monthly Salary Import) is already
 * accounted for in `computation.tdsDeducted` — it is never overwritten.
 */
export default function MyTaxSummaryCards({
  declaration,
}: MyTaxSummaryCardsProps) {
  const { summary } = declaration;
  const { computation } = summary;

  // --- Remaining months and recommended TDS are computed by the backend tax engine ---
  const remainingMonths = declaration.financialYear?.remainingMonths ?? 12;
  const recommendedMonthlyTds = computation.recommendedMonthlyTds ?? 0;

  const money = (value: number) => (
    <MoneyText value={value} variant="h6" sx={{ fontWeight: 700 }} />
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2,
        mb: 3,
        alignItems: "stretch",
        "& > *": { height: "100%" },
      }}
    >
      {/* Card 1 — Estimated Annual Tax */}
      <StatCard
        label="Estimated Annual Tax"
        value={money(computation.totalTaxPayable)}
        icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />}
        trend="Based on current declarations"
      />

      {/* Card 2 — TDS Deducted Till Date */}
      <StatCard
        label="TDS Deducted Till Date"
        value={money(computation.tdsDeducted)}
        icon={<PaymentsOutlinedIcon sx={{ fontSize: 16 }} />}
        trend="Sum of salary + prev. employment TDS"
      />

      {/* Card 3 — Remaining Tax */}
      <StatCard
        label="Remaining Tax"
        value={money(computation.balanceTaxPayable)}
        icon={<SavingsOutlinedIcon sx={{ fontSize: 16 }} />}
        trend={
          computation.balanceTaxPayable < 0
            ? "Excess TDS deducted"
            : "To be collected over remaining months"
        }
        trendDirection={computation.balanceTaxPayable < 0 ? "up" : "flat"}
      />

      {/* Card 4 — Remaining Months */}
      <StatCard
        label="Remaining Months"
        value={`${remainingMonths}`}
        icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />}
        trend="Months left in current financial year"
      />

      {/* Card 5 — Recommended Monthly TDS */}
      <StatCard
        label="Recommended Monthly TDS"
        value={money(recommendedMonthlyTds)}
        icon={<TrendingDownOutlinedIcon sx={{ fontSize: 16 }} />}
        trend={
          remainingMonths > 0
            ? `Remaining Tax ÷ ${remainingMonths} months`
            : "Financial year ended"
        }
      />
    </Box>
  );
}
