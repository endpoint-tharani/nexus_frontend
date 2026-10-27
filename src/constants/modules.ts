// =============================================================================
// PRODUCT MODULES — the catalog of purchasable platform capabilities.
//
// The whole frontend (sidebar, routes, dashboard widgets, permissions) is driven
// by which modules a company has enabled. This file is the SINGLE source of truth
// for the module identifiers + their marketplace metadata. Everything else
// (registry, stores, guards) derives from here.
//
// We can't use TS `enum` (tsconfig has `erasableSyntaxOnly: true`), so — exactly
// like `constants/enums.ts` — each "enum" is an `as const` object with a derived
// union type.
// =============================================================================

// ---------------------------------------------------------------------------
// ProductModule — every capability the platform can sell.
// `CORE` is special: it is NOT purchasable, it is always enabled and carries the
// always-on chrome (Dashboard, Employees, Company, Subscription management…).
// ---------------------------------------------------------------------------
export const ProductModule = {
  CORE: "CORE",
  TAX_DECLARATION: "TAX_DECLARATION",
  ATTENDANCE: "ATTENDANCE",
  LEAVE: "LEAVE",
  PAYROLL: "PAYROLL",
  BIOMETRIC: "BIOMETRIC",
  EMPLOYEE_PORTAL: "EMPLOYEE_PORTAL",
  COMPLIANCE: "COMPLIANCE",
} as const;
export type ProductModule = (typeof ProductModule)[keyof typeof ProductModule];

// The modules a company can actually buy (CORE is implicit, always-on).
export const PURCHASABLE_MODULES: readonly ProductModule[] = [
  ProductModule.TAX_DECLARATION,
  ProductModule.ATTENDANCE,
  ProductModule.LEAVE,
  ProductModule.PAYROLL,
  ProductModule.BIOMETRIC,
  ProductModule.EMPLOYEE_PORTAL,
  ProductModule.COMPLIANCE,
];

// CORE + everything purchasable — used as the graceful "enable all" fallback when
// the backend hasn't (yet) told us which modules are active.
export const ALL_MODULES: readonly ProductModule[] = [
  ProductModule.CORE,
  ...PURCHASABLE_MODULES,
];

// Canonical render order (sidebar groups, marketplace grid). CORE first.
export const MODULE_ORDER: readonly ProductModule[] = ALL_MODULES;

// ---------------------------------------------------------------------------
// Module subscription status — drives the marketplace card state.
// ---------------------------------------------------------------------------
export const ModuleStatus = {
  ENABLED: "ENABLED", // purchased + active
  TRIAL: "TRIAL", // active on a time-limited trial
  EXPIRED: "EXPIRED", // was active, subscription lapsed
  DISABLED: "DISABLED", // available to purchase, not active
} as const;
export type ModuleStatus = (typeof ModuleStatus)[keyof typeof ModuleStatus];

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  ENABLED: "Enabled",
  TRIAL: "Trial",
  EXPIRED: "Expired",
  DISABLED: "Disabled",
};

// MUI Chip color per module status — reused by every marketplace/subscription card.
export const MODULE_STATUS_COLORS: Record<
  ModuleStatus,
  "default" | "success" | "info" | "warning" | "error"
> = {
  ENABLED: "success",
  TRIAL: "info",
  EXPIRED: "error",
  DISABLED: "default",
};

// ---------------------------------------------------------------------------
// Marketplace metadata (label/description/tagline/category). Pure data — the
// React icon lives in the module registry so this file stays dependency-free and
// importable from guards/stores without pulling in React.
// ---------------------------------------------------------------------------
export interface ModuleMeta {
  module: ProductModule;
  label: string;
  tagline: string;
  description: string;
  category: "HR" | "Time" | "Finance" | "Compliance" | "Platform";
}

export const MODULE_META: Record<ProductModule, ModuleMeta> = {
  CORE: {
    module: ProductModule.CORE,
    label: "Core Workspace",
    tagline: "Always included",
    description:
      "Company workspace, people directory, dashboards and subscription management. Bundled with every plan.",
    category: "Platform",
  },
  TAX_DECLARATION: {
    module: ProductModule.TAX_DECLARATION,
    label: "Tax Declaration",
    tagline: "Investment proofs & TDS",
    description:
      "Collect employee investment declarations, verify proofs, approve and generate tax reports.",
    category: "Finance",
  },
  ATTENDANCE: {
    module: ProductModule.ATTENDANCE,
    label: "Attendance",
    tagline: "Shifts, holidays & daily logs",
    description:
      "Track daily attendance, manage shifts and holidays, handle regularizations and lock months.",
    category: "Time",
  },
  LEAVE: {
    module: ProductModule.LEAVE,
    label: "Leave",
    tagline: "Balances & approvals",
    description:
      "Leave policies, balances, employee requests and an approval workflow for managers.",
    category: "Time",
  },
  PAYROLL: {
    module: ProductModule.PAYROLL,
    label: "Payroll",
    tagline: "Runs, payslips & structures",
    description:
      "Salary structures, payroll runs, payslip generation and pay registers with reporting.",
    category: "Finance",
  },
  BIOMETRIC: {
    module: ProductModule.BIOMETRIC,
    label: "Biometric Integration",
    tagline: "Devices & sync",
    description:
      "Connect biometric/RFID devices and sync punches automatically into attendance.",
    category: "Time",
  },
  EMPLOYEE_PORTAL: {
    module: ProductModule.EMPLOYEE_PORTAL,
    label: "Employee Portal",
    tagline: "Self-service home",
    description:
      "A single self-service home for employees — payslips, tax, attendance and requests.",
    category: "HR",
  },
  COMPLIANCE: {
    module: ProductModule.COMPLIANCE,
    label: "Compliance",
    tagline: "PF, ESI & statutory",
    description:
      "Statutory registers and filings — PF, ESI, professional tax and compliance calendar.",
    category: "Compliance",
  },
};

// ---------------------------------------------------------------------------
// Parsing helpers — normalize whatever the backend / a dev override hands us into
// the strict union. Unknown values are dropped (never throw).
// ---------------------------------------------------------------------------
const MODULE_VALUES = new Set<string>(Object.values(ProductModule));

export const parseModule = (raw: unknown): ProductModule | null => {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toUpperCase();
  return MODULE_VALUES.has(key) ? (key as ProductModule) : null;
};

export const parseModules = (raw: unknown): ProductModule[] => {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];
  const seen = new Set<ProductModule>();
  for (const value of list) {
    const parsed = parseModule(value);
    if (parsed) seen.add(parsed);
  }
  return [...seen];
};

// Order a module list by the canonical render order (CORE first).
export const orderModules = (modules: readonly ProductModule[]): ProductModule[] =>
  MODULE_ORDER.filter((m) => modules.includes(m));
