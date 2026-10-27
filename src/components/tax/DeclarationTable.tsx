import { useMemo } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdCancel,
  MdCheckCircleOutline,
  MdFileDownload,
  MdVisibility,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DateText, MoneyText, StatusChip } from "../ui";
import {
  DeclarationStatus,
  TAX_REGIME_LABELS,
} from "../../constants/enums";
import type { TaxDeclaration } from "../../types";
import { formatFinancialYear, toNumber } from "../../utils/format";

export interface DeclarationTableProps {
  declarations: TaxDeclaration[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasFilters?: boolean;
  // Id of the declaration currently being exported (shows a spinner on its row).
  exportingId?: string | null;
  onView: (declaration: TaxDeclaration) => void;
  onApprove: (declaration: TaxDeclaration) => void;
  onReject: (declaration: TaxDeclaration) => void;
  onExport: (declaration: TaxDeclaration) => void;
}

const employeeLabel = (d: TaxDeclaration) =>
  d.employeeName ?? d.employeeCode ?? d.employeeId;

// Compact proof-coverage chip: green once every declared item is backed by a
// proof document, amber while some are still missing, neutral when no items.
function ProofChip({
  proofCount = 0,
  itemCount = 0,
}: {
  proofCount?: number;
  itemCount?: number;
}) {
  if (itemCount === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }
  const complete = proofCount >= itemCount;
  return (
    <Chip
      size="small"
      label={`${proofCount}/${itemCount}`}
      color={complete ? "success" : "warning"}
      variant="outlined"
      sx={{ fontWeight: 700, minWidth: 56 }}
    />
  );
}

// The admin declarations table, built on the shared DataTable primitive so it
// inherits sorting, pagination, column show/hide, sticky header and the
// uniform loading/empty/error states. Approve/Reject are only actionable while a
// declaration is SUBMITTED. Owns no data fetching — the page passes rows + state.
export default function DeclarationTable({
  declarations,
  loading = false,
  error = null,
  onRetry,
  hasFilters = false,
  exportingId = null,
  onView,
  onApprove,
  onReject,
  onExport,
}: DeclarationTableProps) {
  const columns = useMemo<ColumnDef<TaxDeclaration>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.original.employeeName ?? "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.employeeCode ?? row.original.employeeId}
            </Typography>
          </Box>
        ),
      },
      {
        id: "year",
        header: "Financial Year",
        accessorFn: (d) => d.year,
        cell: ({ row }) => formatFinancialYear(row.original.year),
      },
      {
        accessorKey: "regime",
        header: "Regime",
        cell: ({ row }) =>
          TAX_REGIME_LABELS[row.original.regime] ?? row.original.regime,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusChip kind="declaration" status={row.original.status} />
        ),
      },
      {
        id: "grandTotalSalary",
        header: "Annual Salary",
        accessorFn: (d) => toNumber(d.grandTotalSalary) ?? 0,
        meta: { align: "right" },
        cell: ({ row }) => (
          <MoneyText value={row.original.grandTotalSalary} fractionDigits={0} />
        ),
      },
      {
        id: "estimatedTax",
        header: "Est. Tax",
        accessorFn: (d) => toNumber(d.estimatedTax) ?? 0,
        meta: { align: "right" },
        cell: ({ row }) => (
          <MoneyText value={row.original.estimatedTax} fractionDigits={0} />
        ),
      },
      {
        id: "proofs",
        header: "Proofs",
        enableSorting: false,
        meta: { align: "center" },
        cell: ({ row }) => (
          <ProofChip
            proofCount={row.original.proofCount}
            itemCount={row.original.itemCount}
          />
        ),
      },
      {
        id: "submittedAt",
        header: "Submitted",
        accessorFn: (d) => d.submittedAt ?? "",
        cell: ({ row }) => <DateText value={row.original.submittedAt} />,
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={declarations}
      loading={loading}
      error={error}
      onRetry={onRetry}
      getRowId={(d) => d.id}
      onRowClick={onView}
      enableColumnVisibility
      dense
      // Stretch to fill the page height and pin the pagination footer to the
      // bottom — it always shows, even for a single record.
      fillHeight
      ariaLabel="Tax declarations"
      emptyTitle="No declarations found"
      emptyDescription={
        hasFilters
          ? "Try a different financial year, status or search."
          : "Declarations appear here once employees start filing for the year."
      }
      rowActions={(declaration) => {
        const canDecide = declaration.status === DeclarationStatus.SUBMITTED;
        const isExporting = exportingId === declaration.id;
        const label = employeeLabel(declaration);

        return (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.25 }}>
            <Tooltip title="View details">
              <IconButton
                size="small"
                color="primary"
                aria-label={`View declaration for ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onView(declaration);
                }}
              >
                <MdVisibility size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                canDecide
                  ? "Approve"
                  : "Only submitted declarations can be approved"
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="success"
                  aria-label={`Approve declaration for ${label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(declaration);
                  }}
                  disabled={!canDecide}
                >
                  <MdCheckCircleOutline size={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                canDecide
                  ? "Reject"
                  : "Only submitted declarations can be rejected"
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Reject declaration for ${label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(declaration);
                  }}
                  disabled={!canDecide}
                >
                  <MdCancel size={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Export to Excel">
              <span>
                <IconButton
                  size="small"
                  color="secondary"
                  aria-label={`Export declaration for ${label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(declaration);
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <MdFileDownload size={18} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      }}
    />
  );
}
