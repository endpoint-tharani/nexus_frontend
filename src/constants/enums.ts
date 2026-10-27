// Canonical domain enums for the whole app.
//
// We can't use TS `enum` (tsconfig has `erasableSyntaxOnly: true`), so each
// enum is an `as const` object. The matching union type is derived with
// `typeof`, and every enum ships a label map + an `options` array ready to
// feed straight into MUI <Select> / <Autocomplete> components.

// --- helper: build a [{ value, label }] array from a values object + labels ---
type Option<T extends string> = { value: T; label: string };

const toOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>
): Option<T>[] => values.map((value) => ({ value, label: labels[value] }));

// ---------------------------------------------------------------------------
// Employee status
// ---------------------------------------------------------------------------
export const EmployeeStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  RESIGNED: "RESIGNED",
  TERMINATED: "TERMINATED",
} as const;
export type EmployeeStatus =
  (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  RESIGNED: "Resigned",
  TERMINATED: "Terminated",
};

export const EMPLOYEE_STATUS_OPTIONS = toOptions(
  Object.values(EmployeeStatus),
  EMPLOYEE_STATUS_LABELS
);

// MUI Chip color per employee status — reused by the table + status dialog.
export const EMPLOYEE_STATUS_COLORS: Record<
  EmployeeStatus,
  "default" | "success" | "warning" | "error"
> = {
  ACTIVE: "success",
  INACTIVE: "default",
  RESIGNED: "warning",
  TERMINATED: "error",
};

// ---------------------------------------------------------------------------
// Gender (employee demographic)
// ---------------------------------------------------------------------------
export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const GENDER_OPTIONS = toOptions(Object.values(Gender), GENDER_LABELS);

// Readonly tuple of gender values for building a Zod enum without re-listing
// the literals (keeps the schema in sync with this single source of truth).
export const GENDER_VALUES = Object.values(Gender) as [Gender, ...Gender[]];

// ---------------------------------------------------------------------------
// Payroll upload type
// ---------------------------------------------------------------------------
export const PayrollUploadType = {
  SALARY: "SALARY",
  INCENTIVE: "INCENTIVE",
  BONUS_BULK_UPLOAD: "BONUS_BULK_UPLOAD",
} as const;
export type PayrollUploadType =
  (typeof PayrollUploadType)[keyof typeof PayrollUploadType];

export const PAYROLL_UPLOAD_TYPE_LABELS: Record<PayrollUploadType, string> = {
  SALARY: "Salary",
  INCENTIVE: "Incentive",
  BONUS_BULK_UPLOAD: "Bonus bulk upload",
};

export const PAYROLL_UPLOAD_TYPE_OPTIONS = toOptions(
  Object.values(PayrollUploadType),
  PAYROLL_UPLOAD_TYPE_LABELS
);

// ---------------------------------------------------------------------------
// Pay component type (a single line on a pay statement)
// ---------------------------------------------------------------------------
export const PayComponentType = {
  EARNING: "EARNING",
  DEDUCTION: "DEDUCTION",
} as const;
export type PayComponentType =
  (typeof PayComponentType)[keyof typeof PayComponentType];

export const PAY_COMPONENT_TYPE_LABELS: Record<PayComponentType, string> = {
  EARNING: "Earning",
  DEDUCTION: "Deduction",
};

export const PAY_COMPONENT_TYPE_OPTIONS = toOptions(
  Object.values(PayComponentType),
  PAY_COMPONENT_TYPE_LABELS
);

// ---------------------------------------------------------------------------
// Tax declaration status (workflow state)
// ---------------------------------------------------------------------------
export const DeclarationStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type DeclarationStatus =
  (typeof DeclarationStatus)[keyof typeof DeclarationStatus];

// "NOT_STARTED" is deliberately absent from `DeclarationStatus`: it is not a
// workflow state the backend stores or filters by, only the admin-side bucket
// for employees with no declaration yet. Mapping it here keeps StatusChip
// consistent without it leaking into the status filter or the tab options.
export const DECLARATION_STATUS_LABELS: Record<
  DeclarationStatus | "NOT_STARTED",
  string
> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NOT_STARTED: "Not Started",
};

export const DECLARATION_STATUS_OPTIONS = toOptions(
  Object.values(DeclarationStatus),
  DECLARATION_STATUS_LABELS
);

// MUI Chip color per status — reused by tables, cards and detail headers.
export const DECLARATION_STATUS_COLORS: Record<
  DeclarationStatus | "NOT_STARTED",
  "default" | "info" | "success" | "error" | "warning"
> = {
  DRAFT: "default",
  SUBMITTED: "info",
  APPROVED: "success",
  REJECTED: "error",
  NOT_STARTED: "warning",
};

// ---------------------------------------------------------------------------
// Form 16 status
// ---------------------------------------------------------------------------
export const Form16Status = {
  PENDING: "PENDING",
  GENERATING: "GENERATING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type Form16Status = (typeof Form16Status)[keyof typeof Form16Status];

export const FORM16_STATUS_LABELS: Record<Form16Status, string> = {
  PENDING: "Pending",
  GENERATING: "Generating",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const FORM16_STATUS_OPTIONS = toOptions(
  Object.values(Form16Status),
  FORM16_STATUS_LABELS
);

export const FORM16_STATUS_COLORS: Record<
  Form16Status,
  "default" | "warning" | "info" | "success" | "error"
> = {
  PENDING: "warning",
  GENERATING: "info",
  COMPLETED: "success",
  FAILED: "error",
};


// ---------------------------------------------------------------------------
// Tax regime
// ---------------------------------------------------------------------------
export const TaxRegime = {
  OLD: "OLD",
  NEW: "NEW",
} as const;
export type TaxRegime = (typeof TaxRegime)[keyof typeof TaxRegime];

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  OLD: "Old Regime",
  NEW: "New Regime",
};

export const TAX_REGIME_OPTIONS = toOptions(
  Object.values(TaxRegime),
  TAX_REGIME_LABELS
);

// ---------------------------------------------------------------------------
// Tax sections (Indian Income Tax Act deduction sections)
// ---------------------------------------------------------------------------
export const TaxSection = {
  SECTION_80C: "SECTION_80C",
  SECTION_80CCD: "SECTION_80CCD",
  SECTION_80CCD_1B: "SECTION_80CCD_1B",
  SECTION_80D: "SECTION_80D",
  SECTION_80DD: "SECTION_80DD",
  SECTION_80DDB: "SECTION_80DDB",
  SECTION_80E: "SECTION_80E",
  SECTION_80G: "SECTION_80G",
  HRA: "HRA",
  HOME_LOAN: "HOME_LOAN",
  NPS: "NPS",
  OTHER: "OTHER",
} as const;
export type TaxSection = (typeof TaxSection)[keyof typeof TaxSection];

export const TAX_SECTION_LABELS: Record<TaxSection, string> = {
  SECTION_80C: "80C — Investments (PF, ELSS, LIC…)",
  SECTION_80CCD: "80CCD — NPS Contribution",
  SECTION_80CCD_1B: "80CCD(1B) — Additional NPS",
  SECTION_80D: "80D — Health Insurance",
  SECTION_80DD: "80DD — Disabled Dependent",
  SECTION_80DDB: "80DDB — Medical Treatment",
  SECTION_80E: "80E — Education Loan Interest",
  SECTION_80G: "80G — Donations",
  HRA: "HRA — House Rent Allowance",
  HOME_LOAN: "Home Loan Interest (24b)",
  NPS: "NPS",
  OTHER: "Other",
};

export const TAX_SECTION_OPTIONS = toOptions(
  Object.values(TaxSection),
  TAX_SECTION_LABELS
);

// ---------------------------------------------------------------------------
// Company role — drives owner-only UI (backend: verifyCompanyRootAccess) and
// the role-based sidebar / route visibility (App Shell phase).
// ASSUMPTION: role is exposed on the `/user/me` (and company) payload. OWNER and
// EMPLOYEE were the only roles the backend was confirmed to use; ADMIN and HR
// are added to back the role-visibility matrix the App Shell brief requires.
// ---------------------------------------------------------------------------
export const CompanyRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
  DEPARTMENT_ADMIN: "DEPARTMENT_ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type CompanyRole = (typeof CompanyRole)[keyof typeof CompanyRole];

export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  BRANCH_ADMIN: "Branch administrator",
  DEPARTMENT_ADMIN: "Department administrator",
  HR: "HR Manager",
  EMPLOYEE: "Employee",
  SUPER_ADMIN: "Super Admin",
};

// MUI Chip color per role — used by the team management table.
export const COMPANY_ROLE_COLORS: Record<
  CompanyRole,
  "default" | "primary" | "info" | "secondary"
> = {
  OWNER: "primary",
  ADMIN: "info",
  BRANCH_ADMIN: "secondary",
  DEPARTMENT_ADMIN: "secondary",
  HR: "secondary",
  EMPLOYEE: "default",
  SUPER_ADMIN: "primary",
};

// Roles that an owner may invite as staff (OWNER/EMPLOYEE are not invitable here).
export const INVITABLE_ROLES = [CompanyRole.ADMIN, CompanyRole.HR] as const;

export const INVITABLE_ROLE_OPTIONS = INVITABLE_ROLES.map((value) => ({
  value,
  label: COMPANY_ROLE_LABELS[value],
}));

// ---------------------------------------------------------------------------
// Staff / team-member status (company membership lifecycle).
// INVITED  → invite sent, not yet accepted.
// ACTIVE   → accepted, full member.
// DISABLED → access revoked.
// ASSUMPTION: backend exposes these on the company staff/team list.
// ---------------------------------------------------------------------------
export const StaffStatus = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;
export type StaffStatus = (typeof StaffStatus)[keyof typeof StaffStatus];

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  INVITED: "Invited",
  ACTIVE: "Active",
  DISABLED: "Disabled",
};

export const STAFF_STATUS_COLORS: Record<
  StaffStatus,
  "default" | "info" | "success" | "error"
> = {
  INVITED: "info",
  ACTIVE: "success",
  DISABLED: "default",
};

// ---------------------------------------------------------------------------
// Attendance status (per-day classification — mirrors backend AttendanceStatus).
// Drives the attendance log, the daily dashboard and the employee calendar.
// ---------------------------------------------------------------------------
export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  LEAVE: "LEAVE",
  HOLIDAY: "HOLIDAY",
  WEEKLY_OFF: "WEEKLY_OFF",
  WORK_FROM_HOME: "WORK_FROM_HOME",
  ON_DUTY: "ON_DUTY",
  LATE_ENTRY: "LATE_ENTRY",
  EARLY_EXIT: "EARLY_EXIT",
} as const;
export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  HALF_DAY: "Half day",
  LEAVE: "Leave",
  HOLIDAY: "Holiday",
  WEEKLY_OFF: "Weekly off",
  WORK_FROM_HOME: "Work from home",
  ON_DUTY: "On duty",
  LATE_ENTRY: "Late entry",
  EARLY_EXIT: "Early exit",
};

export const ATTENDANCE_STATUS_OPTIONS = toOptions(
  Object.values(AttendanceStatus),
  ATTENDANCE_STATUS_LABELS
);

// Readonly tuple for building a Zod enum without re-listing the literals.
export const ATTENDANCE_STATUS_VALUES = Object.values(AttendanceStatus) as [
  AttendanceStatus,
  ...AttendanceStatus[],
];

// MUI Chip color per attendance status — reused by the log table, the daily
// dashboard and the employee calendar so the color language never drifts.
export const ATTENDANCE_STATUS_COLORS: Record<
  AttendanceStatus,
  "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
> = {
  PRESENT: "success",
  ABSENT: "error",
  HALF_DAY: "warning",
  LEAVE: "info",
  HOLIDAY: "secondary",
  WEEKLY_OFF: "default",
  WORK_FROM_HOME: "info",
  ON_DUTY: "info",
  LATE_ENTRY: "warning",
  EARLY_EXIT: "warning",
};

// ---------------------------------------------------------------------------
// Attendance source — how a row was created (read-only display).
// ---------------------------------------------------------------------------
export const AttendanceSource = {
  MANUAL: "MANUAL",
  BULK_UPLOAD: "BULK_UPLOAD",
  BIOMETRIC: "BIOMETRIC",
  SELF_SERVICE: "SELF_SERVICE",
  REGULARIZATION: "REGULARIZATION",
  SYSTEM: "SYSTEM",
} as const;
export type AttendanceSource =
  (typeof AttendanceSource)[keyof typeof AttendanceSource];

export const ATTENDANCE_SOURCE_LABELS: Record<AttendanceSource, string> = {
  MANUAL: "Manual",
  BULK_UPLOAD: "Bulk upload",
  BIOMETRIC: "Biometric",
  SELF_SERVICE: "Self-service",
  REGULARIZATION: "Regularization",
  SYSTEM: "System",
};

// ---------------------------------------------------------------------------
// Regularization workflow status (employee correction requests).
// ---------------------------------------------------------------------------
export const RegularizationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type RegularizationStatus =
  (typeof RegularizationStatus)[keyof typeof RegularizationStatus];

export const REGULARIZATION_STATUS_LABELS: Record<RegularizationStatus, string> =
  {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

export const REGULARIZATION_STATUS_OPTIONS = toOptions(
  Object.values(RegularizationStatus),
  REGULARIZATION_STATUS_LABELS
);

export const REGULARIZATION_STATUS_COLORS: Record<
  RegularizationStatus,
  "default" | "warning" | "success" | "error"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

// The decision an approver records on a regularization (review action).
export const RegularizationAction = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type RegularizationAction =
  (typeof RegularizationAction)[keyof typeof RegularizationAction];

// ---------------------------------------------------------------------------
// Shift type — mirrors backend ShiftType. Drives the create/edit form, the
// shift table chip and the type filter.
// ---------------------------------------------------------------------------
export const ShiftType = {
  GENERAL: "GENERAL",
  MORNING: "MORNING",
  EVENING: "EVENING",
  NIGHT: "NIGHT",
  FLEXIBLE: "FLEXIBLE",
} as const;
export type ShiftType = (typeof ShiftType)[keyof typeof ShiftType];

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  GENERAL: "General",
  MORNING: "Morning",
  EVENING: "Evening",
  NIGHT: "Night",
  FLEXIBLE: "Flexible",
};

export const SHIFT_TYPE_OPTIONS = toOptions(
  Object.values(ShiftType),
  SHIFT_TYPE_LABELS
);

export const SHIFT_TYPE_VALUES = Object.values(ShiftType) as [
  ShiftType,
  ...ShiftType[],
];

// MUI Chip color per shift type — reused by the shift table + reports.
export const SHIFT_TYPE_COLORS: Record<
  ShiftType,
  "default" | "primary" | "info" | "secondary" | "warning"
> = {
  GENERAL: "primary",
  MORNING: "info",
  EVENING: "warning",
  NIGHT: "secondary",
  FLEXIBLE: "default",
};

// ---------------------------------------------------------------------------
// Weekly-off pattern — the backend stores a 7-char Sun..Sat string ('1' = off).
// The form exposes day toggles + a few presets; these constants are the single
// source of truth for both.
// ---------------------------------------------------------------------------
export const WEEKDAYS = [
  { index: 0, label: "Sunday", short: "Sun" },
  { index: 1, label: "Monday", short: "Mon" },
  { index: 2, label: "Tuesday", short: "Tue" },
  { index: 3, label: "Wednesday", short: "Wed" },
  { index: 4, label: "Thursday", short: "Thu" },
  { index: 5, label: "Friday", short: "Fri" },
  { index: 6, label: "Saturday", short: "Sat" },
] as const;

export const DEFAULT_WEEKLY_OFF_PATTERN = "1000000";

export const WEEKLY_OFF_PRESETS = [
  { value: "1000000", label: "Sunday off" },
  { value: "1000001", label: "Saturday & Sunday off" },
  { value: "0000001", label: "Saturday off" },
  { value: "0000000", label: "No weekly off" },
] as const;

// ---------------------------------------------------------------------------
// Holiday type — mirrors backend HolidayType.
// ---------------------------------------------------------------------------
export const HolidayType = {
  NATIONAL: "NATIONAL",
  REGIONAL: "REGIONAL",
  COMPANY: "COMPANY",
  OPTIONAL: "OPTIONAL",
  RESTRICTED: "RESTRICTED",
} as const;
export type HolidayType = (typeof HolidayType)[keyof typeof HolidayType];

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  NATIONAL: "National",
  REGIONAL: "Regional",
  COMPANY: "Company",
  OPTIONAL: "Optional",
  RESTRICTED: "Restricted",
};

export const HOLIDAY_TYPE_OPTIONS = toOptions(
  Object.values(HolidayType),
  HOLIDAY_TYPE_LABELS
);

export const HOLIDAY_TYPE_VALUES = Object.values(HolidayType) as [
  HolidayType,
  ...HolidayType[],
];

export const HOLIDAY_TYPE_COLORS: Record<
  HolidayType,
  "default" | "primary" | "info" | "secondary" | "warning" | "success"
> = {
  NATIONAL: "primary",
  REGIONAL: "info",
  COMPANY: "success",
  OPTIONAL: "warning",
  RESTRICTED: "secondary",
};

// ---------------------------------------------------------------------------
// Holiday scope — mirrors backend HolidayScope (COMPANY-wide or BRANCH-specific).
// ---------------------------------------------------------------------------
export const HolidayScope = {
  COMPANY: "COMPANY",
  BRANCH: "BRANCH",
} as const;
export type HolidayScope = (typeof HolidayScope)[keyof typeof HolidayScope];

export const HOLIDAY_SCOPE_LABELS: Record<HolidayScope, string> = {
  COMPANY: "Company-wide",
  BRANCH: "Branch-specific",
};

export const HOLIDAY_SCOPE_OPTIONS = toOptions(
  Object.values(HolidayScope),
  HOLIDAY_SCOPE_LABELS
);

export const HOLIDAY_SCOPE_VALUES = Object.values(HolidayScope) as [
  HolidayScope,
  ...HolidayScope[],
];
