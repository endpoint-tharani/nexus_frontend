import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { MdClose, MdExpandMore } from "react-icons/md";

import { usePayStatement } from "../../hooks/payroll";
import { PAYROLL_UPLOAD_TYPE_LABELS } from "../../constants/enums";
import type { PayStatementMonth, PayStatementComponentTotal, Money } from "../../types";
import {
  formatCurrency,
  formatFinancialYear,
  getMonthName,
  toNumber,
} from "../../utils/format";

export interface PayStatementViewProps {
  open: boolean;
  employeeId: string | null;
  year: number;
  employeeName?: string;
  onClose: () => void;
}

// Month gross/deductions/net combined. Supporting regular + arrears, and falls back to flat values.
const monthTotals = (month: PayStatementMonth) => {
  const arrears = month.arrears;
  const hasArrears = arrears ? (toNumber(arrears.gross) ?? 0) > 0 : false;
  
  const regGross = toNumber(month.regular?.gross ?? month.gross) ?? 0;
  const arrGross = hasArrears && arrears ? (toNumber(arrears.gross) ?? 0) : 0;
  
  const regDed = toNumber(month.regular?.totalDeductions ?? month.totalDeductions) ?? 0;
  const arrDed = hasArrears && arrears ? (toNumber(arrears.totalDeductions) ?? 0) : 0;
  
  const regNet = toNumber(month.regular?.netPay ?? month.netPay) ?? 0;
  const arrNet = hasArrears && arrears ? (toNumber(arrears.netPay) ?? 0) : 0;

  return {
    gross: regGross + arrGross,
    deductions: regDed + arrDed,
    net: regNet + arrNet,
  };
};

const getSectionComponents = (
  componentsMap: Record<string, Money> | undefined,
  componentTotals: PayStatementComponentTotal[]
) => {
  const earnings: { name: string; amount: number }[] = [];
  const deductions: { name: string; amount: number }[] = [];

  if (componentsMap) {
    Object.entries(componentsMap).forEach(([code, amount]) => {
      const amt = toNumber(amount) ?? 0;
      if (amt === 0) return;
      const meta = componentTotals.find((c) => c.code === code);
      const name = meta?.name ?? code;
      const type = meta?.type ?? "EARNING";

      if (type === "DEDUCTION") {
        deductions.push({ name, amount: amt });
      } else {
        earnings.push({ name, amount: amt });
      }
    });
  }
  return { earnings, deductions };
};

function SalarySectionDisplay({
  title,
  earnings,
  deductions,
  gross,
  net,
}: {
  title: string;
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  gross: number;
  net: number;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 280, p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
        {title}
      </Typography>
      
      {/* Earnings */}
      {earnings.map((e, idx) => (
        <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
          <Typography variant="body2" color="text.secondary">{e.name}</Typography>
          <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(e.amount)}
          </Typography>
        </Box>
      ))}
      
      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderTop: "1px dashed", borderColor: "divider", mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Gross</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(gross)}
        </Typography>
      </Box>

      {/* Deductions */}
      {deductions.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          {deductions.map((d, idx) => (
            <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
              <Typography variant="body2" color="error.main">{d.name}</Typography>
              <Typography variant="body2" sx={{ color: "error.main", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(d.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      
      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderTop: "1px dashed", borderColor: "divider", mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Net</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(net)}
        </Typography>
      </Box>
    </Box>
  );
}

function TotalsDisplay({
  gross,
  deductions,
  net,
}: {
  gross: number;
  deductions: number;
  net: number;
}) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Total Salary
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">Total Gross</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(gross)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">Total Deductions</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "error.main" }}>
            {formatCurrency(deductions)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">Total Net Salary</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "success.main" }}>
            {formatCurrency(net)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: "1 1 160px",
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: highlight ? "action.hover" : "transparent",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="h6"
        color="text.primary"
        sx={{ fontWeight: 700, mt: 0.5 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function PayStatementView({
  open,
  employeeId,
  year,
  employeeName,
  onClose,
}: PayStatementViewProps) {
  const { data, isLoading, isError } = usePayStatement(
    employeeId ?? undefined,
    year
  );

  const months = data?.months ?? [];
  const componentTotals = data?.componentTotals ?? [];

  // FY totals come from the statement's grandTotal rollup (actual + projected).
  const totalGross = toNumber(data?.totals.grandTotal.gross) ?? 0;
  const totalDeductions =
    toNumber(data?.totals.grandTotal.totalDeductions) ?? 0;
  const totalNet = toNumber(data?.totals.grandTotal.netPay) ?? 0;

  const heading = employeeName ?? data?.employee.name ?? "Pay Statement";
  const fyStart = data?.financialYear.start ?? year;
  const uploadType = data?.uploadType;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        Pay Statement
        <Typography variant="body2" color="text.secondary">
          {heading} · {formatFinancialYear(fyStart)}
          {uploadType
            ? ` · ${PAYROLL_UPLOAD_TYPE_LABELS[uploadType] ?? uploadType}`
            : ""}
        </Typography>
        <IconButton
          aria-label="Close pay statement"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="error" sx={{ fontWeight: 600 }}>
              Failed to load the pay statement.
            </Typography>
          </Box>
        ) : months.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              No pay statement available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              There is no payroll data for this employee in the selected year.
            </Typography>
          </Box>
        ) : (
          <>
            {/* FY totals (include projected months) */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
              <SummaryCard
                label="Gross Salary"
                value={formatCurrency(totalGross)}
              />
              <SummaryCard
                label="Deductions"
                value={formatCurrency(totalDeductions)}
              />
              <SummaryCard
                label="Net Pay (projected)"
                value={formatCurrency(totalNet)}
                highlight
              />
            </Box>

            {/* Per-month breakdown */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {months.map((month, index) => {
                const t = monthTotals(month);
                const arrears = month.arrears;
                const hasArrears = arrears ? (toNumber(arrears.gross) ?? 0) > 0 : false;
                
                const regularSection = month.regular ?? {
                  gross: month.gross,
                  totalDeductions: month.totalDeductions,
                  netPay: month.netPay,
                  components: month.components,
                };
                const arrearsSection = month.arrears;

                const regularComp = getSectionComponents(
                  regularSection.components,
                  componentTotals
                );
                const arrearsComp = hasArrears && arrearsSection
                  ? getSectionComponents(arrearsSection.components, componentTotals)
                  : { earnings: [], deductions: [] };

                return (
                  <Accordion
                    key={`${month.year}-${month.month}-${index}`}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: "divider",
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<MdExpandMore size={20} />}
                      sx={{ px: 2, bgcolor: "action.hover" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", pr: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {getMonthName(month.month)} {month.year}
                          </Typography>
                          {month.source === "PROJECTED" && (
                            <Chip
                              size="small"
                              label="Projected"
                              color="info"
                              variant="outlined"
                              sx={{ fontWeight: 600, height: 20 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Gross: <strong>{formatCurrency(t.gross)}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Net: <strong>{formatCurrency(t.net)}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        <SalarySectionDisplay
                          title="Regular Salary"
                          earnings={regularComp.earnings}
                          deductions={regularComp.deductions}
                          gross={toNumber(regularSection.gross) ?? 0}
                          net={toNumber(regularSection.netPay) ?? 0}
                        />
                        {hasArrears && arrearsSection && (
                          <SalarySectionDisplay
                            title="Arrears Salary"
                            earnings={arrearsComp.earnings}
                            deductions={arrearsComp.deductions}
                            gross={toNumber(arrearsSection?.gross) ?? 0}
                            net={toNumber(arrearsSection?.netPay) ?? 0}
                          />
                        )}
                      </Box>
                      {hasArrears && (
                        <TotalsDisplay
                          gross={t.gross}
                          deductions={t.deductions}
                          net={t.net}
                        />
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
