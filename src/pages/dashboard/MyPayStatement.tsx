import { useState } from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import {
  MdPayments,
  MdRemoveCircleOutline,
  MdSavings,
} from "react-icons/md";

import {
  EmptyState,
  EmployeeViewLocked,
  ErrorState,
  LoadingSkeleton,
  MoneyText,
  PageHeader,
  SectionCard,
  StatCard,
} from "../../components/ui";
import SalaryRegisterTable from "../../components/payroll/SalaryRegisterTable";
import { usePayStatement } from "../../hooks/payroll";
import { useMyDeclaration } from "../../hooks/meTax";
import { useEmployeeViewLocked } from "../../hooks/shared/useEmployeeViewLocked";
import {
  financialYearOptions,
  formatFinancialYear,
  getFinancialYear,
  toNumber,
} from "../../utils/format";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

// Employee self-service pay statement. Read-only financial-year view with
// actuals + projection, presented as a full salary register (month × component
// matrix) so the employee sees every earning and deduction at a glance — the
// same layout as the payroll spreadsheet. The employee's own id is resolved
// from their tax declaration for the year (no dedicated `/me/pay-statement`
// endpoint — the shared `/payroll/pay-statement` is reachable for one's own id).
export default function MyPayStatement() {
  const [year, setYear] = useState<number>(CURRENT_FY);

  // Admin can lock employee self-service company-wide; skip the fetches when so.
  const locked = useEmployeeViewLocked();

  // Resolve the caller's employeeId from their own declaration (token-scoped).
  const {
    data: declaration,
    isLoading: declarationLoading,
    isError: declarationError,
    refetch: refetchDeclaration,
  } = useMyDeclaration(year, undefined, { enabled: !locked });
  const employeeId = declaration?.employeeId;

  const {
    data,
    isLoading: payLoading,
    isError: payError,
    refetch: refetchPay,
  } = usePayStatement(employeeId, year, undefined, { enabled: !locked });

  const loading = declarationLoading || (!!employeeId && payLoading);
  const isError = declarationError || payError;
  const months = data?.months ?? [];
  const componentTotals = data?.componentTotals ?? [];

  // FY totals come from the statement's grandTotal rollup (actual + projected).
  const totalGross = toNumber(data?.totals.grandTotal.gross) ?? 0;
  const totalDeductions =
    toNumber(data?.totals.grandTotal.totalDeductions) ?? 0;
  const totalNet = toNumber(data?.totals.grandTotal.netPay) ?? 0;
  const projectedCount = months.filter((m) => m.source === "PROJECTED").length;

  const fySelector = (
    <TextField
      select
      label="Financial Year"
      size="small"
      value={year}
      onChange={(e) => setYear(Number(e.target.value))}
      sx={{ minWidth: 200 }}
    >
      {FY_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box>
      <PageHeader
        title="My Pay Statement"
        subtitle={`Financial year ${formatFinancialYear(year)}`}
        actions={fySelector}
      />

      {locked ? (
        <EmployeeViewLocked feature="pay statement" />
      ) : loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <LoadingSkeleton variant="card" count={3} />
          <LoadingSkeleton variant="table" rows={6} columns={5} />
        </Box>
      ) : isError ? (
        <ErrorState
          description="We couldn't load your pay statement. Please try again."
          onRetry={() => {
            refetchDeclaration();
            refetchPay();
          }}
        />
      ) : !employeeId || months.length === 0 ? (
        <EmptyState
          title="No pay statement available"
          description={`There is no payroll data on record for ${formatFinancialYear(
            year
          )}. Try selecting a different financial year.`}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Projection summary */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
            }}
          >
            <StatCard
              label="Gross earnings (FY)"
              value={<MoneyText value={totalGross} variant="h4" sx={{ fontWeight: 700 }} />}
              icon={<MdPayments size={22} />}
              color="primary"
            />
            <StatCard
              label="Total deductions (FY)"
              value={<MoneyText value={totalDeductions} variant="h4" sx={{ fontWeight: 700 }} />}
              icon={<MdRemoveCircleOutline size={22} />}
              color="warning"
            />
            <StatCard
              label="Net pay (projected)"
              value={<MoneyText value={totalNet} variant="h4" sx={{ fontWeight: 700 }} />}
              icon={<MdSavings size={22} />}
              color="success"
              trend={
                projectedCount > 0
                  ? `${projectedCount} month${projectedCount > 1 ? "s" : ""} projected`
                  : undefined
              }
            />
          </Box>

          {/* Salary register — month × component matrix */}
          <SectionCard
            title="Salary register"
            subtitle="Month-by-month breakdown of every earning and deduction. All amounts are in ₹; “–” means nil. Projected months are estimated from your latest salary, and scroll sideways to see every component."
            disableContentPadding
          >
            <SalaryRegisterTable
              months={months}
              componentTotals={componentTotals}
              totals={data!.totals}
            />
          </SectionCard>
        </Box>
      )}
    </Box>
  );
}
