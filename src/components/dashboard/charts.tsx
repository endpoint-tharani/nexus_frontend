import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MONTHS } from "../../constants/app";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  toNumber,
} from "../../utils/format";
import type {
  Employee,
  PayrollRun,
  PayStatementMonth,
  TaxSummary,
} from "../../types";

// All chart colors are pulled from the MUI theme palette (never hardcoded hex),
// so the dashboard stays on-brand and dark-mode-ready.

// Shared, theme-aware tooltip chrome so every chart's tooltip matches the cards.
const tooltipStyle = (theme: Theme) => ({
  contentStyle: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    boxShadow: theme.shadows[3],
    fontSize: 13,
    padding: "8px 12px",
  },
  labelStyle: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    marginBottom: 4,
  },
  itemStyle: { color: theme.palette.text.primary, padding: 0 },
});

// Recharts value formatter: render a money series as full ₹ in the tooltip.
// `value` arrives as recharts' ValueType (number | string | array | undefined).
const moneyTooltip =
  (label: string) =>
  (value: number | string | ReadonlyArray<number | string> | undefined) =>
    [
      formatCurrency(Array.isArray(value) ? value[0] : value, { fractionDigits: 0 }),
      label,
    ] as [string, string];

// --- Declaration status distribution (donut with center total) ------------
export function DeclarationStatusChart({ summary }: { summary: TaxSummary }) {
  const theme = useTheme();
  const data = useMemo(
    () =>
      [
        { name: "Approved", value: summary.approvedCount, color: theme.palette.success.main },
        { name: "Submitted", value: summary.submittedCount, color: theme.palette.info.main },
        { name: "Draft", value: summary.draftCount, color: theme.palette.grey[400] },
        { name: "Rejected", value: summary.rejectedCount, color: theme.palette.error.main },
        { name: "Not started", value: summary.notStartedCount, color: theme.palette.grey[300] },
      ].filter((slice) => slice.value > 0),
    [summary, theme]
  );
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle(theme)} />
          <Legend verticalAlign="bottom" height={28} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>

      {/* Center total — the donut hole carries the headline number. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bottom: 28, // clear the legend so the label sits in the ring's center
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
          {formatNumber(total, "0")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Declarations
        </Typography>
      </Box>
    </Box>
  );
}

// --- Payroll net-pay trend: total net pay per month, chronological, last 12 -
export function PayrollNetPayTrendChart({ runs }: { runs: PayrollRun[] }) {
  const theme = useTheme();
  const data = useMemo(() => {
    const buckets = new Map<number, { label: string; net: number }>();
    for (const run of runs) {
      if (!run.year || !run.month) continue;
      const key = run.year * 12 + run.month;
      const net = toNumber(run.totalNetPay) ?? 0;
      const existing = buckets.get(key);
      if (existing) existing.net += net;
      else
        buckets.set(key, {
          label: `${MONTHS[run.month - 1]?.short ?? run.month} ${String(run.year).slice(2)}`,
          net,
        });
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .slice(-12)
      .map(([, v]) => v);
  }, [runs]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="netPayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <YAxis
          width={56}
          tickFormatter={(v) => formatCompactCurrency(v)}
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          {...tooltipStyle(theme)}
          formatter={moneyTooltip("Net pay")}
          cursor={{ stroke: theme.palette.primary.main, strokeOpacity: 0.25, strokeWidth: 1.5 }}
        />
        <Area
          type="monotone"
          dataKey="net"
          name="Net pay"
          stroke={theme.palette.primary.main}
          strokeWidth={2.5}
          fill="url(#netPayFill)"
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- Headcount by department (from the loaded employee page) --------------
export function HeadcountByDepartmentChart({ employees }: { employees: Employee[] }) {
  const theme = useTheme();
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of employees) {
      const name = e.department?.name ?? "Unassigned";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [employees]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <Tooltip {...tooltipStyle(theme)} cursor={{ fill: theme.palette.action.hover }} />
        <Bar dataKey="value" name="Employees" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Employee pay trend: net pay per month, projected months dimmed --------
export function PayNetTrendChart({ months }: { months: PayStatementMonth[] }) {
  const theme = useTheme();
  const data = useMemo(
    () =>
      months.map((m) => ({
        label: m.label.split("-")[0], // "APR-2025" -> "APR"
        net: toNumber(m.netPay) ?? 0,
        projected: m.source === "PROJECTED",
      })),
    [months]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
        <XAxis
          dataKey="label"
          interval={0}
          tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <YAxis
          width={56}
          tickFormatter={(v) => formatCompactCurrency(v)}
          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          {...tooltipStyle(theme)}
          formatter={moneyTooltip("Net pay")}
          cursor={{ fill: theme.palette.action.hover }}
        />
        <Bar dataKey="net" name="Net pay" radius={[4, 4, 0, 0]} maxBarSize={34}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.projected ? theme.palette.grey[400] : theme.palette.primary.main}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
