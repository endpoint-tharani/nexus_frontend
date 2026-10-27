import { useMemo } from "react";
import { Box, Button, Grid } from "@mui/material";
import {
  MdGroups,
  MdPayments,
  MdPendingActions,
  MdCheckCircle,
} from "react-icons/md";
import { Link as RouterLink } from "react-router-dom";
import { useSubscriptionAccess } from "../../core/subscription";
import { getIconComponent } from "../../utils/iconMap";

import { StatCard, SectionCard } from "../ui";
import ChartCard from "./ChartCard";
import {
  DeclarationStatusChart,
  PayrollNetPayTrendChart,
  HeadcountByDepartmentChart,
} from "./charts";
import { useEmployees } from "../../hooks/employee";
import { useSalaryImportHistory } from "../../hooks/payroll";
import type { PayrollRun } from "../../types";
import { useTaxSummary } from "../../hooks/tax";
import {
  formatCompactCurrency,
  formatFinancialYear,
  formatNumber,
  getFinancialYear,
  toNumber,
} from "../../utils/format";

const DASHBOARD_EMPLOYEE_SAMPLE = 100;

// QUICK_ACTIONS has been replaced with dynamic quickActions inside the component.

/**
 * Owner / Admin / HR view: real KPIs + charts driven by the live employee,
 * payroll and tax-summary endpoints. Every chart handles loading/empty/error.
 */
export default function OrgDashboard() {
  const fyYear = getFinancialYear(new Date());

  const employeesQuery = useEmployees({ page: 1, limit: DASHBOARD_EMPLOYEE_SAMPLE });
  const runsQuery = useSalaryImportHistory("SALARY");
  const summaryQuery = useTaxSummary(fyYear);
  const { navigation } = useSubscriptionAccess();

  const quickActions = useMemo(() => {
    const rawItems = [
      ...(navigation.base ?? []),
      ...(navigation.management ?? []),
      ...(navigation.sections ?? []).flatMap((s) => s.items ?? []),
    ];

    return rawItems
      .filter((item) => item.key !== "dashboard" && item.path !== "/dashboard")
      .map((item) => {
        const path = item.path.startsWith("/dashboard") ? item.path : `/dashboard${item.path}`;
        return {
          label: item.label,
          path,
          icon: getIconComponent(item.icon),
        };
      });
  }, [navigation]);

  const employees = employeesQuery.data ?? [];
  const employeeCount = employees.length;
  const runs = runsQuery.data ?? [];
  const summary = summaryQuery.data;

  const totalNetPay = runs.reduce(
    (sum: number, run: PayrollRun) => sum + (toNumber(run.totalNetPay) ?? 0),
    0
  );

  const declarationTotal = summary
    ? summary.draftCount +
      summary.submittedCount +
      summary.approvedCount +
      summary.rejectedCount
    : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Total Employees"
            value={formatNumber(employeeCount, "0")}
            icon={<MdGroups size={18} />}
            loading={employeesQuery.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Net Pay Paid"
            value={formatCompactCurrency(totalNetPay, "₹0")}
            icon={<MdPayments size={18} />}
            loading={runsQuery.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Pending Declarations"
            value={formatNumber(summary?.submittedCount ?? 0, "0")}
            icon={<MdPendingActions size={18} />}
            loading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Approved Declarations"
            value={formatNumber(summary?.approvedCount ?? 0, "0")}
            icon={<MdCheckCircle size={18} />}
            loading={summaryQuery.isLoading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions" subtitle="Common tasks for today">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {quickActions.map(({ label, icon: Icon, path }) => (
            <Button
              key={path}
              component={RouterLink}
              to={path}
              variant="outlined"
              startIcon={<Icon size={16} />}
              sx={{
                borderColor: "divider",
                color: "text.primary",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderRadius: "8px",
                textTransform: "none",
                px: 2,
                py: 0.875,
                "&:hover": { borderColor: "primary.light", bgcolor: "action.hover" },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </SectionCard>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard
            title="Net pay trend"
            subtitle="Total net pay by month"
            loading={runsQuery.isLoading}
            error={runsQuery.isError}
            empty={runs.length === 0}
            emptyTitle="No payroll runs yet"
            height={300}
            onRetry={() => runsQuery.refetch()}
          >
            <PayrollNetPayTrendChart runs={runs} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Declaration status"
            subtitle={formatFinancialYear(fyYear)}
            loading={summaryQuery.isLoading}
            error={summaryQuery.isError}
            empty={declarationTotal === 0}
            emptyTitle="No declarations yet"
            height={300}
            onRetry={() => summaryQuery.refetch()}
          >
            {summary && <DeclarationStatusChart summary={summary} />}
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ChartCard
            title="Headcount by department"
            subtitle={
              employeeCount > employees.length
                ? `Based on a sample of ${employees.length}`
                : undefined
            }
            loading={employeesQuery.isLoading}
            error={employeesQuery.isError}
            empty={employees.length === 0}
            emptyTitle="No employees yet"
            height={300}
            onRetry={() => employeesQuery.refetch()}
          >
            <HeadcountByDepartmentChart employees={employees} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
