import { Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import { formatDate, formatDateTime } from "../../utils/format";

export interface DateTextProps extends Omit<TypographyProps, "children"> {
  value?: string | null;
  /** Include the time component, e.g. "12 Jun 2026, 4:30 PM". */
  withTime?: boolean;
  /** Custom dayjs template (ignored when `withTime` is set). */
  template?: string;
  fallback?: string;
}

// Centralized date rendering — routes through the shared `formatDate` /
// `formatDateTime` helpers so dates are consistent everywhere.
export default function DateText({
  value,
  withTime = false,
  template,
  fallback = "—",
  variant = "body2",
  ...rest
}: DateTextProps) {
  const text = withTime
    ? formatDateTime(value, fallback)
    : formatDate(value, template, fallback);

  return (
    <Typography component="span" variant={variant} {...rest}>
      {text}
    </Typography>
  );
}
