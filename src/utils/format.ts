// Display formatting helpers. Framework-agnostic; safe to call from anywhere.

import dayjs from "dayjs";
import { MONTHS } from "../constants/app";

type Money = string | number | null | undefined;

// Coerce a string|number money value to a finite number, or null if unparseable.
export const toNumber = (value: Money): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

// Format a monetary amount as Indian Rupees, e.g. 125000 -> "₹1,25,000.00".
export const formatCurrency = (
  value: Money,
  options?: { fractionDigits?: number; fallback?: string }
): string => {
  const n = toNumber(value);
  if (n === null) return options?.fallback ?? "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: options?.fractionDigits ?? 2,
    maximumFractionDigits: options?.fractionDigits ?? 2,
  }).format(n);
};

// Compact Indian-rupee amount for tight spaces (chart axes, KPI badges), e.g.
// 125000 -> "₹1.3L", 25000000 -> "₹2.5Cr". Falls back like formatCurrency.
export const formatCompactCurrency = (value: Money, fallback = "—"): string => {
  const n = toNumber(value);
  if (n === null) return fallback;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};

// Plain grouped number, e.g. 125000 -> "1,25,000".
export const formatNumber = (value: Money, fallback = "—"): string => {
  const n = toNumber(value);
  if (n === null) return fallback;
  return new Intl.NumberFormat("en-IN").format(n);
};

// Format an ISO date string, e.g. "12 Jun 2026". Returns fallback on bad input.
export const formatDate = (
  value?: string | null,
  template = "DD MMM YYYY",
  fallback = "—"
): string => {
  if (!value) return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format(template) : fallback;
};

// Date + time, e.g. "12 Jun 2026, 4:30 PM".
export const formatDateTime = (
  value?: string | null,
  fallback = "—"
): string => formatDate(value, "DD MMM YYYY, h:mm A", fallback);

// 1-indexed month number -> full name, e.g. 6 -> "June".
export const getMonthName = (month?: number, fallback = "—"): string =>
  MONTHS.find((m) => m.value === month)?.label ?? fallback;

// "June 2026" from (year, 1-indexed month).
export const formatMonthYear = (year?: number, month?: number): string => {
  if (!year || !month) return "—";
  return `${getMonthName(month)} ${year}`;
};

// --- Indian financial year helpers (April–March) ---

// FY starting year for a given JS Date. Jan–Mar belong to the previous FY.
export const getFinancialYear = (date: Date): number =>
  date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;

// Pretty label for an FY starting year, e.g. 2026 -> "FY 2026–27".
export const formatFinancialYear = (startYear: number): string =>
  `FY ${startYear}–${String((startYear + 1) % 100).padStart(2, "0")}`;

// Build a list of selectable financial years (newest first).
export const financialYearOptions = (
  currentYear: number,
  back = 4
): Array<{ value: number; label: string }> =>
  Array.from({ length: back + 1 }, (_, i) => {
    const value = currentYear - i;
    return { value, label: formatFinancialYear(value) };
  });

// Full name from first/last; tolerates missing last name.
export const fullName = (
  firstName?: string,
  lastName?: string,
  fallback = "—"
): string => {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
};

// First-letter avatar initial.
export const initial = (name?: string, fallback = "?"): string =>
  name?.trim()?.charAt(0)?.toUpperCase() || fallback;
