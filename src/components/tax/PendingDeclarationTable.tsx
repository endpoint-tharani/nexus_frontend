import { useMemo } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { MdAdd } from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, StatusChip } from "../ui";
import type { TaxSummaryGridRow } from "../../types";
import { formatFinancialYear } from "../../utils/format";

export interface PendingDeclarationTableProps {
  rows: TaxSummaryGridRow[];
  year: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasFilters?: boolean;
  // Employee id whose declaration is currently being opened (spinner on its row).
  creatingEmployeeId?: string | null;
  onCreate: (row: TaxSummaryGridRow) => void;
}

// Employees with no declaration for the year, sourced from the summary grid's
// NOT_STARTED rows (the list endpoint can't return them — there is no row to
// return). The single action opens a DRAFT declaration so the admin can file on
// the employee's behalf.
export default function PendingDeclarationTable({
  rows,
  year,
  loading = false,
  error = null,
  onRetry,
  hasFilters = false,
  creatingEmployeeId = null,
  onCreate,
}: PendingDeclarationTableProps) {
  const columns = useMemo<ColumnDef<TaxSummaryGridRow>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.original.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.employeeCode}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) =>
          row.original.email ?? (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        id: "year",
        header: "Financial Year",
        enableSorting: false,
        cell: () => formatFinancialYear(year),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusChip kind="declaration" status={row.original.status} />
        ),
      },
    ],
    [year]
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      loading={loading}
      error={error}
      onRetry={onRetry}
      getRowId={(row) => row.employeeId}
      dense
      fillHeight
      ariaLabel="Employees without a tax declaration"
      emptyTitle="Nothing pending"
      emptyDescription={
        hasFilters
          ? "Try a different financial year, employee or search."
          : "Every employee has started a declaration for this year."
      }
      rowActions={(row) => {
        const isCreating = creatingEmployeeId === row.employeeId;

        return (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                isCreating ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <MdAdd size={16} />
                )
              }
              aria-label={`Create declaration for ${row.employeeName}`}
              onClick={(e) => {
                e.stopPropagation();
                onCreate(row);
              }}
              disabled={isCreating}
            >
              Create Declaration
            </Button>
          </Box>
        );
      }}
    />
  );
}
