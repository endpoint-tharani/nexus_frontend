import { Fragment } from "react";
import type { ReactNode } from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

import { PayComponentType } from "../../constants/enums";
import type {
  PayStatement,
  PayStatementComponentTotal,
  PayStatementMonth,
} from "../../types";
import { getMonthName, toNumber } from "../../utils/format";

type CellValue = string | number | null | undefined;

export interface SalaryRegisterTableProps {
  months: PayStatementMonth[];
  componentTotals: PayStatementComponentTotal[];
  totals: PayStatement["totals"];
}

const NIL = "–";

function formatCell(value: CellValue): { text: string; muted: boolean } {
  const n = toNumber(value);
  if (n === null) return { text: "—", muted: true };
  if (n === 0) return { text: NIL, muted: true };
  return {
    text: new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n),
    muted: false,
  };
}

const headBg = (theme: Theme) =>
  theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900];

const stickyColSx: SxProps<Theme> = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  bgcolor: "background.paper",
  borderRight: "1px solid",
  borderRightColor: "divider",
  whiteSpace: "nowrap",
  minWidth: 200,
  width: 200,
};

type Tone = "earning" | "deduction" | "summary";

function NumCell({
  value,
  tone = "earning",
  bold,
  emphasize,
}: {
  value: CellValue;
  tone?: Tone;
  bold?: boolean;
  emphasize?: boolean;
}) {
  const { text, muted } = formatCell(value);
  const color = muted
    ? "text.disabled"
    : tone === "deduction"
    ? "error.main"
    : "text.primary";
  return (
    <TableCell
      align="right"
      sx={{ whiteSpace: "nowrap", minWidth: 120, width: 120, ...(emphasize ? { bgcolor: "action.hover" } : null) }}
    >
      <Typography
        component="span"
        variant="body2"
        color={color}
        sx={{ fontWeight: bold ? 700 : 400, fontVariantNumeric: "tabular-nums" }}
      >
        {text}
      </Typography>
    </TableCell>
  );
}

type RowVariant = "month" | "subtotal" | "grand";

function DataRow({
  label,
  chip,
  earnings,
  deductionCols,
  getAmount,
  gross,
  totalDeductions,
  net,
  variant = "month",
}: {
  label: string;
  chip?: ReactNode;
  earnings: PayStatementComponentTotal[];
  deductionCols: PayStatementComponentTotal[];
  getAmount: (code: string) => CellValue;
  gross: CellValue;
  totalDeductions: CellValue;
  net: CellValue;
  variant?: RowVariant;
}) {
  const emphasized = variant !== "month";
  const rowSx: SxProps<Theme> | undefined =
    variant === "grand"
      ? { "& td": { borderTop: "2px solid", borderTopColor: "divider" } }
      : undefined;

  return (
    <TableRow hover={variant === "month"} sx={rowSx}>
      <TableCell sx={stickyColSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ fontWeight: emphasized ? 700 : 600 }}
          >
            {label}
          </Typography>
          {chip}
        </Box>
      </TableCell>

      {earnings.map((ct) => (
        <NumCell key={ct.code} value={getAmount(ct.code)} tone="earning" bold={emphasized} />
      ))}
      <NumCell value={gross} tone="summary" bold emphasize />

      {deductionCols.map((ct) => (
        <NumCell key={ct.code} value={getAmount(ct.code)} tone="deduction" bold={emphasized} />
      ))}
      <NumCell value={totalDeductions} tone="deduction" bold emphasize />

      <NumCell value={net} tone="summary" bold emphasize />
    </TableRow>
  );
}

function SectionLabel({
  text,
  chip,
  colSpan,
}: {
  text: string;
  chip?: ReactNode;
  colSpan: number;
}) {
  const getBgColor = (theme: Theme) => {
    if (theme.palette.mode === "light") return "#F1F5F9";
    if (theme.palette.background.paper === "#0F0A26") return "#1B133E";
    return "#2A2A2A";
  };

  return (
    <TableRow>
      <TableCell
        sx={{
          ...stickyColSx,
          bgcolor: getBgColor,
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 0.6 }}
          >
            {text}
          </Typography>
          {chip}
        </Box>
      </TableCell>
      <TableCell
        colSpan={colSpan - 1}
        sx={{
          bgcolor: getBgColor,
          py: 1,
        }}
      />
    </TableRow>
  );
}

const ProjectedChip = (
  <Chip
    size="small"
    label="Projected"
    color="info"
    variant="outlined"
    sx={{ height: 18, fontSize: 10, fontWeight: 700, "& .MuiChip-label": { px: 0.75 } }}
  />
);

const BeforeJoiningChip = (
  <Chip
    size="small"
    label="Before Joining"
    color="default"
    variant="outlined"
    sx={{ height: 18, fontSize: 10, fontWeight: 700, "& .MuiChip-label": { px: 0.75 } }}
  />
);

const sumSectionTotals = (
  sectionMonths: PayStatementMonth[],
  sectionExtractor: (m: PayStatementMonth) => any
) => {
  let gross = 0;
  let totalDeductions = 0;
  let netPay = 0;
  const componentsSum: Record<string, number> = {};

  sectionMonths.forEach((m) => {
    const sec = sectionExtractor(m);
    if (!sec) return;
    gross += toNumber(sec.gross) ?? 0;
    totalDeductions += toNumber(sec.totalDeductions) ?? 0;
    netPay += toNumber(sec.netPay) ?? 0;
    
    if (sec.components) {
      Object.entries(sec.components).forEach(([code, amt]) => {
        componentsSum[code] = (componentsSum[code] ?? 0) + (toNumber(amt as any) ?? 0);
      });
    }
  });

  return {
    gross,
    totalDeductions,
    netPay,
    getAmount: (code: string) => componentsSum[code] ?? 0,
  };
};

export default function SalaryRegisterTable({
  months,
  componentTotals,
}: SalaryRegisterTableProps) {
  const earnings = componentTotals.filter((c) => c.type === PayComponentType.EARNING);
  const deductionCols = componentTotals.filter(
    (c) => c.type === PayComponentType.DEDUCTION
  );

  const regExtractor = (m: PayStatementMonth) => m.regular ?? m;
  const arrExtractor = (m: PayStatementMonth) => m.arrears;

  // 1. Arrears Salary rows data
  const arrearsMonths = months.filter((m) => {
    const arr = m.arrears;
    return arr ? (toNumber(arr.gross) ?? 0) > 0 : false;
  });
  const hasArrears = arrearsMonths.length > 0;
  const arrearsGrandTotals = sumSectionTotals(arrearsMonths, arrExtractor);

  // 2. Regular Salary rows data
  const regularActualMonths = months.filter((m) => m.source === "ACTUAL" || m.source === "BEFORE_JOINING");
  const regularProjectedMonths = months.filter((m) => m.source === "PROJECTED");
  const hasRegularActual = regularActualMonths.length > 0;
  const hasRegularProjected = regularProjectedMonths.length > 0;
  const showActualSubtotal = hasRegularActual && (hasRegularProjected || hasArrears);
  const showProjectedSubtotal = hasRegularProjected && (hasRegularActual || hasArrears);

  const hasActualPaid = regularActualMonths.some((m) => m.source === "ACTUAL");

  const regularActualTotals = sumSectionTotals(regularActualMonths, regExtractor);
  const regularProjectedTotals = sumSectionTotals(regularProjectedMonths, regExtractor);
  // Exclude BEFORE_JOINING months from grand total (they are all zeros, but be explicit)
  const grandTotalMonths = months.filter((m) => m.source !== "BEFORE_JOINING");
  const regularGrandTotals = sumSectionTotals(grandTotalMonths, regExtractor);

  // 3. Combined Grand Totals
  const combinedGross = regularGrandTotals.gross + arrearsGrandTotals.gross;
  const combinedDeductions = regularGrandTotals.totalDeductions + arrearsGrandTotals.totalDeductions;
  const combinedNet = regularGrandTotals.netPay + arrearsGrandTotals.netPay;
  const combinedByCode = (code: string) => {
    return regularGrandTotals.getAmount(code) + arrearsGrandTotals.getAmount(code);
  };

  const colCount = 1 + earnings.length + 1 + deductionCols.length + 1 + 1;

  const regularMonthRow = (month: PayStatementMonth, index: number) => {
    const regularData = regExtractor(month);
    const arrears = month.arrears;
    const showRegularChip = arrears ? (toNumber(arrears.gross) ?? 0) > 0 : false;
    return (
      <DataRow
        key={`${month.year}-${month.month}-${index}-regular`}
        label={`${getMonthName(month.month)} ${month.year}`}
        chip={
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {month.source === "PROJECTED" && ProjectedChip}
            {month.source === "BEFORE_JOINING" && BeforeJoiningChip}
            {showRegularChip && month.source !== "BEFORE_JOINING" && (
              <Chip
                size="small"
                label="Regular"
                color="primary"
                variant="outlined"
                sx={{ height: 18, fontSize: 10, fontWeight: 700, "& .MuiChip-label": { px: 0.75 } }}
              />
            )}
          </Stack>
        }
        earnings={earnings}
        deductionCols={deductionCols}
        getAmount={(code) => regularData.components?.[code]}
        gross={regularData.gross}
        totalDeductions={regularData.totalDeductions}
        net={regularData.netPay}
      />
    );
  };

  const arrearsMonthRow = (month: PayStatementMonth, index: number) => {
    const arrearsData = arrExtractor(month);
    if (!arrearsData) return null;
    return (
      <DataRow
        key={`${month.year}-${month.month}-${index}-arrears`}
        label={`${getMonthName(month.month)} ${month.year}`}
        chip={
          <Chip
            size="small"
            label="Arrears"
            color="warning"
            variant="outlined"
            sx={{ height: 18, fontSize: 10, fontWeight: 700, "& .MuiChip-label": { px: 0.75 } }}
          />
        }
        earnings={earnings}
        deductionCols={deductionCols}
        getAmount={(code) => arrearsData?.components?.[code]}
        gross={arrearsData?.gross}
        totalDeductions={arrearsData?.totalDeductions}
        net={arrearsData?.netPay}
      />
    );
  };

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{ width: "max-content", minWidth: "100%", borderCollapse: "separate" }}
      >
        <TableHead>
          {/* Group header: Earnings | Deductions | Net */}
          <TableRow>
            <TableCell
              rowSpan={2}
              sx={{ ...stickyColSx, zIndex: 5, bgcolor: headBg, fontWeight: 700, minWidth: 200, width: 200 }}
            >
              Month
            </TableCell>
            <TableCell
              colSpan={earnings.length + 1}
              align="center"
              sx={{
                fontWeight: 700,
                bgcolor: (t) => alpha(t.palette.success.main, 0.14),
                color: "success.dark",
              }}
            >
              Earnings
            </TableCell>
            <TableCell
              colSpan={deductionCols.length + 1}
              align="center"
              sx={{
                fontWeight: 700,
                bgcolor: (t) => alpha(t.palette.error.main, 0.14),
                color: "error.dark",
                borderLeft: "1px solid",
                borderLeftColor: "divider",
              }}
            >
              Deductions
            </TableCell>
            <TableCell
              rowSpan={2}
              align="right"
              sx={{
                fontWeight: 700,
                bgcolor: headBg,
                borderLeft: "1px solid",
                borderLeftColor: "divider",
                whiteSpace: "nowrap",
                minWidth: 120,
                width: 120,
              }}
            >
              Net Pay
            </TableCell>
          </TableRow>

          {/* Column header: each component name, plus the Gross / Total-ded subtotals */}
          <TableRow>
            {earnings.map((ct) => (
              <TableCell
                key={ct.code}
                align="right"
                sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: headBg, minWidth: 120, width: 120 }}
              >
                {ct.name}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: headBg, minWidth: 120, width: 120 }}>
              Gross
            </TableCell>
            {deductionCols.map((ct) => (
              <TableCell
                key={ct.code}
                align="right"
                sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: headBg, minWidth: 120, width: 120 }}
              >
                {ct.name}
              </TableCell>
            ))}
            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                whiteSpace: "nowrap",
                bgcolor: headBg,
                borderLeft: "1px solid",
                borderLeftColor: "divider",
                minWidth: 120,
                width: 120,
              }}
            >
              Total Ded.
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* --- Regular Salary Section --- */}
          {hasRegularActual && (
            <Fragment>
              {showActualSubtotal ? (
                hasRegularProjected ? (
                  <SectionLabel text={hasActualPaid ? "Salary details · paid" : "Salary details"} colSpan={colCount} />
                ) : (
                  <SectionLabel
                    text={hasActualPaid ? "Regular Salary · paid" : "Regular Salary"}
                    chip={
                      hasActualPaid ? (
                        <Chip
                          size="small"
                          label="Paid"
                          color="primary"
                          sx={{ height: 18, fontWeight: 700, fontSize: 9 }}
                        />
                      ) : undefined
                    }
                    colSpan={colCount}
                  />
                )
              ) : null}
              {regularActualMonths.map(regularMonthRow)}
              {showActualSubtotal && hasActualPaid && (
                <DataRow
                  label="Total (paid)"
                  earnings={earnings}
                  deductionCols={deductionCols}
                  getAmount={regularActualTotals.getAmount}
                  gross={regularActualTotals.gross}
                  totalDeductions={regularActualTotals.totalDeductions}
                  net={regularActualTotals.netPay}
                  variant="subtotal"
                />
              )}
            </Fragment>
          )}

          {hasRegularProjected && (
            <Fragment>
              {showProjectedSubtotal && (
                <SectionLabel text="Projection · estimated" colSpan={colCount} />
              )}
              {regularProjectedMonths.map(regularMonthRow)}
              {showProjectedSubtotal && (
                <DataRow
                  label="Total (projected)"
                  earnings={earnings}
                  deductionCols={deductionCols}
                  getAmount={regularProjectedTotals.getAmount}
                  gross={regularProjectedTotals.gross}
                  totalDeductions={regularProjectedTotals.totalDeductions}
                  net={regularProjectedTotals.netPay}
                  variant="subtotal"
                />
              )}
            </Fragment>
          )}

          {/* --- Arrears Salary Section --- */}
          {hasArrears && (
            <Fragment>
              <SectionLabel
                text="Arrears Salary · paid"
                chip={
                  <Chip
                    size="small"
                    label="Paid"
                    color="warning"
                    sx={{ height: 18, fontWeight: 700, fontSize: 9 }}
                  />
                }
                colSpan={colCount}
              />
              {arrearsMonths.map(arrearsMonthRow)}
              <DataRow
                label="Total (paid)"
                earnings={earnings}
                deductionCols={deductionCols}
                getAmount={arrearsGrandTotals.getAmount}
                gross={arrearsGrandTotals.gross}
                totalDeductions={arrearsGrandTotals.totalDeductions}
                net={arrearsGrandTotals.netPay}
                variant="subtotal"
              />
            </Fragment>
          )}

          {/* --- Single Grand Total Section --- */}
          <DataRow
            label="Grand total"
            earnings={earnings}
            deductionCols={deductionCols}
            getAmount={hasArrears ? combinedByCode : regularGrandTotals.getAmount}
            gross={hasArrears ? combinedGross : regularGrandTotals.gross}
            totalDeductions={hasArrears ? combinedDeductions : regularGrandTotals.totalDeductions}
            net={hasArrears ? combinedNet : regularGrandTotals.netPay}
            variant="grand"
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
