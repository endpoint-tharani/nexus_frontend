import { lazy } from "react";
import {
  MdPayments,
  MdSummarize,
  MdAccountBalanceWallet,
  MdBarChart,
  MdDescription,
  MdReceipt,
  MdPendingActions,
  MdSavings,
} from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import { StatCard } from "../../components/ui";
import { useSalaryImportHistory } from "../../hooks/payroll";
import type { PayrollRun } from "../../types";
import {
  formatCompactCurrency,
  formatNumber,
  toNumber,
} from "../../utils/format";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const SalaryImportListPage = lazy(() => import("../../pages/payroll/SalaryImportListPage"));
const SalaryImportDetailsPage = lazy(() => import("../../pages/payroll/SalaryImportDetailsPage"));
const ArrearsSalaryUploadPage = lazy(() => import("../../pages/dashboard/ArrearsSalaryUploadPage"));
const PayStatements = lazy(() => import("../../pages/dashboard/PayStatements"));
const MyPayStatement = lazy(() => import("../../pages/dashboard/MyPayStatement"));
const Form16Page = lazy(() => import("../../pages/payroll/Form16/Form16Page"));
const SalaryStructure = () => (
  <ModulePlaceholder
    title="Salary Structure"
    description="Configure earning/deduction components and CTC templates for your grades."
    icon={<MdAccountBalanceWallet size={32} />}
  />
);
const PayrollReports = () => (
  <ModulePlaceholder
    title="Payroll Reports"
    description="Pay registers, bank-advice and statutory contribution reports are on the way."
    icon={<MdBarChart size={32} />}
  />
);

const { OWNER, ADMIN, HR, EMPLOYEE } = CompanyRole;
const ORG = [OWNER, ADMIN, HR] as const;
const KPI_SPAN = { xs: 6, md: 3 } as const;

// Run statuses that still need processing.
const PENDING_STATUSES = new Set(["DRAFT", "PENDING", "PROCESSING"]);

function PayrollRunsWidget() {
  const { data, isLoading } = useSalaryImportHistory("SALARY");
  return (
    <StatCard
      label="Payroll Runs"
      value={formatNumber((data ?? []).length, "0")}
      icon={<MdReceipt size={22} />}
      color="primary"
      loading={isLoading}
    />
  );
}

function PayrollPendingWidget() {
  const { data, isLoading } = useSalaryImportHistory("SALARY");
  const pending = (data ?? []).filter((r: PayrollRun) =>
    PENDING_STATUSES.has(String(r.status ?? "").toUpperCase())
  ).length;
  return (
    <StatCard
      label="Pending Payroll"
      value={formatNumber(pending, "0")}
      icon={<MdPendingActions size={22} />}
      color="warning"
      loading={isLoading}
    />
  );
}

function PayrollNetSalaryWidget() {
  const { data, isLoading } = useSalaryImportHistory("SALARY");
  const total = (data ?? []).reduce(
    (sum: number, run: PayrollRun) => sum + (toNumber(run.totalNetPay) ?? 0),
    0
  );
  return (
    <StatCard
      label="Net Salary Summary"
      value={formatCompactCurrency(total, "₹0")}
      icon={<MdSavings size={22} />}
      color="success"
      loading={isLoading}
    />
  );
}

export const payrollModule: ModuleDefinition = {
  module: ProductModule.PAYROLL,
  label: "Payroll",
  icon: MdPayments,
  nav: [
    {
      label: "Payroll",
      icon: MdPayments,
      items: [
        {
          label: "Monthly Salary Upload",
          path: "/dashboard/payroll/salary-import",
          icon: MdPayments,
          roles: ORG,
        },
        {
          label: "Pay Statements",
          path: "/dashboard/pay-statements",
          icon: MdSummarize,
          roles: ORG,
        },
        {
          label: "Payroll Reports",
          path: "/dashboard/payroll/reports",
          icon: MdBarChart,
          roles: ORG,
        },
        {
          label: "My Pay Statement",
          path: "/dashboard/my-pay-statement",
          icon: MdDescription,
          roles: [EMPLOYEE],
        },
      ],
    },
  ],
  routes: [
    { path: "payroll", component: SalaryImportListPage, roles: ORG },
    { path: "payroll/salary-import", component: SalaryImportListPage, roles: ORG },
    { path: "payroll/salary-import/:type/:id", component: SalaryImportDetailsPage, roles: ORG },
    { path: "payroll/arrears-upload", component: ArrearsSalaryUploadPage, roles: ORG },
    {
      path: "payroll/salary-structure",
      component: SalaryStructure,
      roles: ORG,
    },
    { path: "pay-statements", component: PayStatements, roles: ORG },
    { path: "payroll/reports", component: PayrollReports, roles: ORG },
    { path: "my-pay-statement", component: MyPayStatement, roles: [EMPLOYEE] },
    { path: "payroll/form16/:employeeId", component: Form16Page, roles: [...ORG, EMPLOYEE] },
  ],
  widgets: [
    {
      id: "payroll.runs",
      component: PayrollRunsWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 20,
    },
    {
      id: "payroll.pending",
      component: PayrollPendingWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 21,
    },
    {
      id: "payroll.net-salary",
      component: PayrollNetSalaryWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 22,
    },
  ],
};
