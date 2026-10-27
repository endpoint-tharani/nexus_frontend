import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  MdReceiptLong,
  MdPerson,
  MdDescription,
  MdArrowForward,
} from "react-icons/md";

import {
  SectionCard,
  StatusChip,
  MoneyText,
  EmptyState,
  ErrorState,
} from "../ui";
import ChartCard from "./ChartCard";
import { PayNetTrendChart } from "./charts";
import { useMyDeclaration } from "../../hooks/meTax";
import { usePayStatement } from "../../hooks/payroll";
import { TAX_REGIME_LABELS } from "../../constants/enums";
import { formatFinancialYear, getFinancialYear } from "../../utils/format";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

// Employee self-service view: their own tax declaration status, a real net-pay
// trend for the year, and quick links. The employee id is resolved from their
// declaration (token-scoped), which also unlocks the pay-statement fetch.
export default function EmployeeDashboard() {
  const fyYear = getFinancialYear(new Date());
  const { data: declaration, isLoading, isError, refetch } = useMyDeclaration(fyYear);

  const employeeId = declaration?.employeeId;
  const payQuery = usePayStatement(employeeId, fyYear, undefined, {
    enabled: !!employeeId,
  });
  const months = payQuery.data?.months ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard
            title="Tax declaration"
            subtitle={formatFinancialYear(fyYear)}
            actions={
              <Button
                component={RouterLink}
                to="/dashboard/my-tax"
                size="small"
                endIcon={<MdArrowForward size={16} />}
              >
                Open
              </Button>
            }
          >
            {isLoading ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={28} width={140} />
                <Skeleton variant="rounded" height={64} />
              </Stack>
            ) : isError ? (
              <ErrorState
                dense
                description="Couldn't load your declaration."
                onRetry={() => refetch()}
              />
            ) : !declaration ? (
              <EmptyState
                dense
                title="No declaration yet"
                description={`Start your ${formatFinancialYear(fyYear)} tax declaration to claim deductions.`}
                action={
                  <Button component={RouterLink} to="/dashboard/my-tax" variant="contained">
                    Start declaration
                  </Button>
                }
              />
            ) : (
              <Stack spacing={2}>
                {declaration.status === "REJECTED" && declaration.rejectionReason && (
                  <Alert severity="error">{declaration.rejectionReason}</Alert>
                )}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  }}
                >
                  <Field label="Status">
                    <StatusChip kind="declaration" status={declaration.status} />
                  </Field>
                  <Field label="Regime">
                    <Typography sx={{ fontWeight: 600 }}>
                      {TAX_REGIME_LABELS[declaration.regime] ?? declaration.regime}
                    </Typography>
                  </Field>
                  <Field label="Total declared">
                    <MoneyText value={declaration.totalDeclared} sx={{ fontWeight: 600 }} />
                  </Field>
                  <Field label="Estimated tax">
                    <MoneyText value={declaration.estimatedTax} sx={{ fontWeight: 600 }} />
                  </Field>
                </Box>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  {declaration.items.length} declared{" "}
                  {declaration.items.length === 1 ? "item" : "items"}.
                </Typography>
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Quick links" sx={{ height: "100%" }}>
            <Stack spacing={1.5}>
              <Button
                component={RouterLink}
                to="/dashboard/my-tax"
                variant="outlined"
                fullWidth
                startIcon={<MdReceiptLong size={18} />}
                sx={{ justifyContent: "flex-start" }}
              >
                My Tax Declaration
              </Button>
              <Button
                component={RouterLink}
                to="/dashboard/my-pay-statement"
                variant="outlined"
                fullWidth
                startIcon={<MdDescription size={18} />}
                sx={{ justifyContent: "flex-start" }}
              >
                My Pay Statement
              </Button>
              <Button
                component={RouterLink}
                to="/dashboard/profile"
                variant="outlined"
                fullWidth
                startIcon={<MdPerson size={18} />}
                sx={{ justifyContent: "flex-start" }}
              >
                My Profile
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Net pay across the financial year (actuals + projection). */}
      <ChartCard
        title="Net pay this year"
        subtitle={`${formatFinancialYear(fyYear)} · projected months are dimmed`}
        loading={isLoading || (!!employeeId && payQuery.isLoading)}
        error={payQuery.isError}
        empty={months.length === 0}
        emptyTitle="No pay statement yet"
        emptyDescription="Your monthly pay statements will appear here once payroll is processed."
        height={280}
        onRetry={() => payQuery.refetch()}
      >
        <PayNetTrendChart months={months} />
      </ChartCard>
    </Box>
  );
}
