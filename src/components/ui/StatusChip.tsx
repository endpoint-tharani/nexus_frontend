import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import {
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_COLORS,
  DECLARATION_STATUS_LABELS,
  DECLARATION_STATUS_COLORS,
  STAFF_STATUS_LABELS,
  STAFF_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  REGULARIZATION_STATUS_LABELS,
  REGULARIZATION_STATUS_COLORS,
  FORM16_STATUS_LABELS,
  FORM16_STATUS_COLORS,
} from "../../constants/enums";

// THE single source of truth for status → color/label across the app. Any table,
// card or detail header that shows a status renders <StatusChip>, so the color
// language can never drift between screens.

type ChipColor = NonNullable<ChipProps["color"]>;

export type StatusKind =
  | "employee"
  | "declaration"
  | "payroll"
  | "staff"
  | "attendance"
  | "regularization"
  | "subscription"
  | "form16";

// EmployeeStatus + DeclarationStatus reuse the canonical enum maps. PayrollRun
// status is treated as an opaque backend string (no enum), so it gets a tolerant
// local map plus a humanized fallback for any value we haven't seen.
const PAYROLL_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  COMPLETED: "Completed",
  PAID: "Paid",
  LOCKED: "Locked",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};
const PAYROLL_STATUS_COLORS: Record<string, ChipColor> = {
  DRAFT: "default",
  PENDING: "warning",
  PROCESSING: "info",
  PROCESSED: "info",
  COMPLETED: "success",
  PAID: "success",
  LOCKED: "secondary",
  FAILED: "error",
  CANCELLED: "error",
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  TRIAL: "Trial",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
  GRACE_PERIOD: "Grace Period",
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, ChipColor> = {
  ACTIVE: "success", // green
  EXPIRED: "error", // red
  TRIAL: "info", // blue
  SUSPENDED: "warning", // orange
  CANCELLED: "default", // grey
  GRACE_PERIOD: "secondary", // purple
};

const LABELS: Record<StatusKind, Record<string, string>> = {
  employee: EMPLOYEE_STATUS_LABELS,
  declaration: DECLARATION_STATUS_LABELS,
  payroll: PAYROLL_STATUS_LABELS,
  staff: STAFF_STATUS_LABELS,
  attendance: ATTENDANCE_STATUS_LABELS,
  regularization: REGULARIZATION_STATUS_LABELS,
  subscription: SUBSCRIPTION_STATUS_LABELS,
  form16: FORM16_STATUS_LABELS,
};
const COLORS: Record<StatusKind, Record<string, ChipColor>> = {
  employee: EMPLOYEE_STATUS_COLORS,
  declaration: DECLARATION_STATUS_COLORS,
  payroll: PAYROLL_STATUS_COLORS,
  staff: STAFF_STATUS_COLORS,
  attendance: ATTENDANCE_STATUS_COLORS,
  regularization: REGULARIZATION_STATUS_COLORS,
  subscription: SUBSCRIPTION_STATUS_COLORS,
  form16: FORM16_STATUS_COLORS,
};

// "SOME_STATUS" → "Some status" for unmapped values.
const humanize = (raw: string): string => {
  const words = raw.replace(/_/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export interface StatusChipProps extends Omit<ChipProps, "label" | "color"> {
  status: string | null | undefined;
  kind: StatusKind;
}

export default function StatusChip({
  status,
  kind,
  size = "small",
  variant = "filled",
  ...rest
}: StatusChipProps) {
  const key = (status ?? "").toUpperCase();
  const label = LABELS[kind][key] ?? (status ? humanize(status) : "—");
  const color = COLORS[kind][key] ?? "default";

  return <Chip label={label} color={color} size={size} variant={variant} {...rest} />;
}
