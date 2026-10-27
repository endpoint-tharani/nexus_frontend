import { lazy } from "react";
import {
  MdReceiptLong,
  MdRequestQuote,
  MdBarChart,
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdSettings,
  MdDescription,
} from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import { StatCard, StatusChip } from "../../components/ui";
import { useTaxSummary } from "../../hooks/tax";
import { useMyDeclaration } from "../../hooks/meTax";
import { formatNumber, getFinancialYear } from "../../utils/format";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const TaxDeclarations = lazy(
  () => import("../../pages/dashboard/TaxDeclarations")
);
const MyTaxDeclaration = lazy(
  () => import("../../pages/dashboard/MyTaxDeclaration")
);
const TaxDeclarationDetailsPage = lazy(
  () => import("../../pages/dashboard/TaxDeclarationDetailsPage")
);
const TaxConfig = lazy(
  () => import("../../pages/dashboard/TaxConfig")
);
const ProofUploadAccess = lazy(
  () => import("../../pages/dashboard/ProofUploadAccess")
);
const Form16Page = lazy(
  () => import("../../pages/dashboard/Form16Page")
);
const TaxReports = () => (
  <ModulePlaceholder
    title="Tax Reports"
    description="Form-16 inputs, TDS summaries and declaration exports for the financial year are on the way."
    icon={<MdBarChart size={32} />}
  />
);

const { OWNER, ADMIN, HR, EMPLOYEE } = CompanyRole;
const ADMIN_ROLES = [OWNER, ADMIN] as const;
const ADMIN_AND_HR_ROLES = [OWNER, ADMIN, HR] as const;

const KPI_SPAN = { xs: 6, md: 3 } as const;

// --- org widgets (driven by the live tax summary) ---
function useFyTaxSummary() {
  return useTaxSummary(getFinancialYear(new Date()));
}

function TaxPendingWidget() {
  const { data, isLoading } = useFyTaxSummary();
  return (
    <StatCard
      label="Pending Declarations"
      value={formatNumber(data?.submittedCount ?? 0, "0")}
      icon={<MdPendingActions size={22} />}
      color="warning"
      loading={isLoading}
    />
  );
}

function TaxApprovedWidget() {
  const { data, isLoading } = useFyTaxSummary();
  return (
    <StatCard
      label="Approved Declarations"
      value={formatNumber(data?.approvedCount ?? 0, "0")}
      icon={<MdCheckCircle size={22} />}
      color="success"
      loading={isLoading}
    />
  );
}

function TaxRejectedWidget() {
  const { data, isLoading } = useFyTaxSummary();
  return (
    <StatCard
      label="Rejected Declarations"
      value={formatNumber(data?.rejectedCount ?? 0, "0")}
      icon={<MdCancel size={22} />}
      color="error"
      loading={isLoading}
    />
  );
}

// --- employee widget: my declaration status ---
function MyTaxStatusWidget() {
  const { data, isLoading } = useMyDeclaration(getFinancialYear(new Date()));
  return (
    <StatCard
      label="My Tax Declaration"
      value={
        data ? (
          <StatusChip kind="declaration" status={data.status} />
        ) : (
          "Not started"
        )
      }
      icon={<MdRequestQuote size={22} />}
      color="info"
      loading={isLoading}
    />
  );
}

export const taxModule: ModuleDefinition = {
  module: ProductModule.TAX_DECLARATION,
  label: "Tax Declaration",
  icon: MdReceiptLong,
  nav: [
    {
      label: "Tax Management",
      icon: MdReceiptLong,
      items: [
        {
          label: "Tax Configuration",
          path: "/dashboard/tax-config",
          icon: MdSettings,
          roles: ADMIN_ROLES,
        },
        {
          label: "Employee Tax Declaration",
          path: "/dashboard/tax",
          icon: MdReceiptLong,
          roles: ADMIN_ROLES,
        },
        {
          label: "Tax Reports",
          path: "/dashboard/tax/reports",
          icon: MdBarChart,
          roles: ADMIN_ROLES,
        },
        {
          label: "Form 16",
          path: "/dashboard/tax/form-16",
          icon: MdDescription,
          roles: ADMIN_ROLES,
        },
        {
          label: "My Tax",
          path: "/dashboard/my-tax",
          icon: MdRequestQuote,
          roles: [EMPLOYEE],
        },
      ],
    },
  ],
  routes: [
    { path: "tax", component: TaxDeclarations, roles: ADMIN_ROLES },
    { path: "tax/declarations/:declarationId", component: TaxDeclarationDetailsPage, roles: ADMIN_ROLES },
    { path: "tax/reports", component: TaxReports, roles: ADMIN_ROLES },
    { path: "tax/form-16", component: Form16Page, roles: ADMIN_ROLES },
    { path: "my-tax", component: MyTaxDeclaration, roles: [EMPLOYEE] },
    { path: "tax-config", component: TaxConfig, roles: ADMIN_ROLES },
    { path: "tax/proof-access", component: ProofUploadAccess, roles: ADMIN_AND_HR_ROLES },
  ],
  widgets: [
    {
      id: "tax.pending",
      component: TaxPendingWidget,
      roles: ADMIN_ROLES,
      span: KPI_SPAN,
      order: 10,
    },
    {
      id: "tax.approved",
      component: TaxApprovedWidget,
      roles: ADMIN_ROLES,
      span: KPI_SPAN,
      order: 11,
    },
    {
      id: "tax.rejected",
      component: TaxRejectedWidget,
      roles: ADMIN_ROLES,
      span: KPI_SPAN,
      order: 12,
    },
    {
      id: "tax.my-status",
      component: MyTaxStatusWidget,
      roles: [EMPLOYEE],
      span: KPI_SPAN,
      order: 10,
    },
  ],
};
