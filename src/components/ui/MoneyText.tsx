import { Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import { formatCurrency } from "../../utils/format";

export interface MoneyTextProps extends Omit<TypographyProps, "children"> {
  value: string | number | null | undefined;
  /** Decimal places (default 2). */
  fractionDigits?: number;
  /** Shown when the value can't be parsed (default "—"). */
  fallback?: string;
}

// Centralized currency rendering — always routes through `formatCurrency`
// (Indian Rupee, grouped) so money looks identical across every screen.
export default function MoneyText({
  value,
  fractionDigits,
  fallback,
  variant = "body2",
  ...rest
}: MoneyTextProps) {
  return (
    <Typography component="span" variant={variant} {...rest}>
      {formatCurrency(value, { fractionDigits, fallback })}
    </Typography>
  );
}
