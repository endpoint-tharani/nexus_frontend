import { useMemo } from "react";
import { Alert, Box, Chip, Divider, Grid, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MdViewModule,
  MdAddBox,
  MdWorkspacePremium,
} from "react-icons/md";

import {
  DataTable,
  DateText,
  MoneyText,
  SectionCard,
  StatCard,
} from "../../components/ui";
import type { DataTableColumnMeta } from "../../components/ui";
import { ModuleCard } from "../../components/subscription";
import {
  resolveModuleStatus,
  useInvoices,
  useSubscription,
} from "../../core/subscription";
import { useEnabledModules } from "../../core/permissions";
import { PURCHASABLE_MODULES } from "../../constants/modules";
import { formatNumber } from "../../utils/format";
import type { Invoice } from "../../types";

const SUB_STATUS_COLOR = {
  ACTIVE: "success",
  TRIAL: "info",
  EXPIRED: "error",
  CANCELLED: "default",
} as const;

const INVOICE_STATUS_COLOR: Record<
  Invoice["status"],
  "success" | "warning" | "error" | "default"
> = {
  PAID: "success",
  DUE: "warning",
  FAILED: "error",
  REFUNDED: "default",
};

// A single key/value line for the plan-details panel.
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.25,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ fontWeight: 600, textAlign: "right" }}>{children}</Box>
    </Box>
  );
}

// Subscription — the whole plan in one place: snapshot stats, plan details, the
// full module marketplace (enable/disable inline) and billing history. Toggling a
// module updates the company's access instantly — the sidebar, routes and
// dashboard all react with no reload.
export default function SubscriptionOverview() {
  const { data: subscription, isLoading } = useSubscription();
  const enabled = useEnabledModules();
  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    isError: invoicesError,
    refetch: refetchInvoices,
  } = useInvoices();

  const active = PURCHASABLE_MODULES.filter((m) => enabled.includes(m));
  const available = PURCHASABLE_MODULES.filter((m) => !enabled.includes(m));

  const interval = subscription?.plan?.interval;
  const intervalLabel =
    interval === "MONTHLY" ? "Monthly" : interval === "YEARLY" ? "Yearly" : "—";

  const invoiceColumns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      { accessorKey: "number", header: "Invoice" },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <DateText value={row.original.date} />,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { align: "right" } satisfies DataTableColumnMeta,
        cell: ({ row }) => <MoneyText value={row.original.amount} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            size="small"
            label={row.original.status}
            color={INVOICE_STATUS_COLOR[row.original.status]}
          />
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {subscription?.isFallback && (
        <Alert severity="info">
          Showing <strong>default access</strong> — your company isn't connected to
          a billing plan yet, so every module is available. Module changes here are
          applied locally to preview the experience.
        </Alert>
      )}

      {/* Snapshot stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Current plan"
            value={subscription?.plan?.name ?? "—"}
            icon={<MdWorkspacePremium size={22} />}
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Status"
            value={
              <Chip
                size="small"
                label={subscription?.status ?? "—"}
                color={
                  subscription ? SUB_STATUS_COLOR[subscription.status] : "default"
                }
              />
            }
            color="info"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Active modules"
            value={formatNumber(active.length, "0")}
            icon={<MdViewModule size={22} />}
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Available to add"
            value={formatNumber(available.length, "0")}
            icon={<MdAddBox size={22} />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Plan details */}
      <SectionCard
        title="Plan details"
        subtitle="Your current subscription at a glance"
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <DetailRow label="Plan">
            {subscription?.plan?.name ?? "—"}
          </DetailRow>
          <Divider />
          <DetailRow label="Status">
            <Chip
              size="small"
              label={subscription?.status ?? "—"}
              color={
                subscription ? SUB_STATUS_COLOR[subscription.status] : "default"
              }
            />
          </DetailRow>
          <Divider />
          <DetailRow label="Billing interval">{intervalLabel}</DetailRow>
          <Divider />
          <DetailRow label="Price">
            {subscription?.plan?.price != null ? (
              <MoneyText value={subscription.plan.price} sx={{ fontWeight: 600 }} />
            ) : (
              "—"
            )}
          </DetailRow>
          <Divider />
          <DetailRow label="Seats">
            {subscription?.seats != null
              ? `${formatNumber(subscription.usedSeats ?? 0, "0")} / ${formatNumber(
                  subscription.seats,
                  "0"
                )}`
              : "—"}
          </DetailRow>
          <Divider />
          <DetailRow label="Renews on">
            {subscription?.renewsAt ? (
              <DateText value={subscription.renewsAt} />
            ) : (
              "—"
            )}
          </DetailRow>
        </Box>
      </SectionCard>

      {/* Modules marketplace — active + available in one grid, read-only */}
      <SectionCard
        title="Modules"
        subtitle="Licensed modules and capabilities provisioned by platform administrator"
      >
        <Grid container spacing={2}>
          {PURCHASABLE_MODULES.map((module) => (
            <Grid key={module} size={{ xs: 12, sm: 6, md: 4 }}>
              <ModuleCard
                module={module}
                status={resolveModuleStatus(module, enabled, subscription ?? null)}
                readOnly
              />
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      {/* Billing history */}
      <SectionCard
        title="Billing history"
        subtitle="Invoices for your subscription"
        disableContentPadding
      >
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          loading={invoicesLoading}
          error={invoicesError ? "Couldn't load billing history." : null}
          onRetry={() => refetchInvoices()}
          getRowId={(row) => row.id}
          emptyTitle="No invoices yet"
          emptyDescription="Invoices will appear here once your subscription is billed."
          ariaLabel="Billing history"
        />
      </SectionCard>
    </Box>
  );
}
