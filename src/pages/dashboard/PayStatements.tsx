import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { MdFileDownload, MdPayments, MdRemoveCircleOutline, MdSavings } from "react-icons/md";

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MoneyText,
  PageHeader,
  SectionCard,
  StatCard,
} from "../../components/ui";
import SalaryRegisterTable from "../../components/payroll/SalaryRegisterTable";
import { usePayStatement } from "../../hooks/payroll";
import { useEmployees } from "../../hooks/employee";
import {
  PAYROLL_UPLOAD_TYPE_OPTIONS,
  PayrollUploadType,
} from "../../constants/enums";
import type { Employee, PayStatementMonth } from "../../types";
import {
  downloadBlob,
  financialYearOptions,
  formatFinancialYear,
  getFinancialYear,
  getMonthName,
  toNumber,
} from "../../utils";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

// Each month carries its own gross/deductions/net rollup; coerce the
// Decimal-as-string|number money fields to plain numbers. Supporting regular + arrears.
const monthTotals = (month: PayStatementMonth) => {
  const arrears = month.arrears;
  const hasArrears = arrears ? (toNumber(arrears.gross) ?? 0) > 0 : false;
  
  const regGross = toNumber(month.regular?.gross ?? month.gross) ?? 0;
  const arrGross = hasArrears ? (toNumber(month.arrears?.gross) ?? 0) : 0;
  
  const regDed = toNumber(month.regular?.totalDeductions ?? month.totalDeductions) ?? 0;
  const arrDed = hasArrears ? (toNumber(month.arrears?.totalDeductions) ?? 0) : 0;
  
  const regNet = toNumber(month.regular?.netPay ?? month.netPay) ?? 0;
  const arrNet = hasArrears ? (toNumber(month.arrears?.netPay) ?? 0) : 0;

  return {
    gross: regGross + arrGross,
    deductions: regDed + arrDed,
    net: regNet + arrNet,
  };
};

// CSV-escape a single cell (quote when it contains a comma/quote/newline).
const csvCell = (value: string | number) => {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

type EmployeeOption = { id: string; label: string };

// Admin/HR view of any employee's financial-year pay statement (actuals +
// projection). Pick a year, an upload type and an employee; the table renders
// inline and can be exported to CSV client-side (there is no `/payroll/export`
// endpoint yet, so the spreadsheet is built in the browser from the statement).
export default function PayStatements() {
  const [year, setYear] = useState<number>(CURRENT_FY);
  const [uploadType, setUploadType] = useState<PayrollUploadType>(
    PayrollUploadType.SALARY
  );
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);

  // One page of employees is plenty to drive a searchable picker.
  const { data: employeePage, isLoading: employeesLoading } = useEmployees({
    limit: 200,
  });
  const employeeOptions = useMemo<EmployeeOption[]>(
    () =>
      (employeePage ?? []).map((e: Employee) => ({
        id: e.id,
        label: e.name + (e.employeeCode ? ` (${e.employeeCode})` : ""),
      })),
    [employeePage]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePayStatement(employee?.id, year, uploadType);

  const months = data?.months ?? [];
  const componentTotals = data?.componentTotals ?? [];

  // FY totals come from the statement's grandTotal rollup (actual + projected).
  const totalGross = toNumber(data?.totals.grandTotal.gross) ?? 0;
  const totalDeductions =
    toNumber(data?.totals.grandTotal.totalDeductions) ?? 0;
  const totalNet = toNumber(data?.totals.grandTotal.netPay) ?? 0;
  const projectedCount = months.filter((m) => m.source === "PROJECTED").length;

  const handleExportCsv = () => {
    if (months.length === 0) return;
    const header = ["Month", "Source", "Gross", "Deductions", "Net"];
    const rows = months.map((m) => {
      const t = monthTotals(m);
      return [
        `${getMonthName(m.month)} ${m.year}`,
        m.source === "PROJECTED" ? "Projected" : "Actual",
        t.gross,
        t.deductions,
        t.net,
      ];
    });
    rows.push(["Total", "", totalGross, totalDeductions, totalNet]);
    const csv = [header, ...rows]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");
    const who = employee?.label.replace(/[^\w.-]+/g, "_") ?? "employee";
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `pay-statement-${who}-FY${year}.csv`
    );
  };

  const controls = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
      <TextField
        select
        label="Financial Year"
        size="small"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        sx={{ minWidth: 160 }}
      >
        {FY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Type"
        size="small"
        value={uploadType}
        onChange={(e) => setUploadType(e.target.value as PayrollUploadType)}
        sx={{ minWidth: 140 }}
      >
        {PAYROLL_UPLOAD_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Autocomplete
        size="small"
        options={employeeOptions}
        loading={employeesLoading}
        value={employee}
        onChange={(_, next) => setEmployee(next)}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        sx={{ minWidth: 280 }}
        renderInput={(params) => (
          <TextField {...params} label="Employee" placeholder="Search name or code" />
        )}
      />
      <Button
        variant="outlined"
        startIcon={<MdFileDownload size={18} />}
        onClick={handleExportCsv}
        disabled={months.length === 0}
      >
        Export CSV
      </Button>
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title="Pay Statements"
        subtitle="View and export employee pay statements by financial year"
        actions={<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>{controls}</Box>}
      />

      {!employee ? (
        <EmptyState
          title="Select an employee"
          description="Choose a financial year and an employee to view their pay statement."
        />
      ) : isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <LoadingSkeleton variant="card" count={3} />
          <LoadingSkeleton variant="table" rows={6} columns={5} />
        </Box>
      ) : isError ? (
        <ErrorState
          description="We couldn't load this pay statement. Please try again."
          onRetry={() => refetch()}
        />
      ) : months.length === 0 ? (
        <EmptyState
          title="No pay statement available"
          description={`There is no payroll data on record for ${
            employee.label
          } in ${formatFinancialYear(year)}.`}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
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
