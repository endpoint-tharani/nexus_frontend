import { useMemo, useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { MdViewColumn } from "react-icons/md";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../constants/app";

// Optional per-column rendering hints, read off `columnDef.meta`.
export interface DataTableColumnMeta {
  align?: "left" | "center" | "right";
  width?: number | string;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];

  // Async states — the four states every data screen must handle.
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // Empty-state customization.
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  emptyIcon?: ReactNode;

  // Behavior.
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  stickyHeader?: boolean;
  maxHeight?: number | string;
  dense?: boolean;
  // Stretch the table card to fill its parent's height (the parent must give it
  // one, e.g. a flex column), so the pagination footer sits at the bottom rather
  // than floating up under a short table. Off by default.
  fillHeight?: boolean;

  // Per-row trailing action slot (rendered in a right-aligned final column).
  rowActions?: (row: TData) => ReactNode;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData, index: number) => string;

  ariaLabel?: string;

  // Server-side support
  serverRowCount?: number;
  serverPage?: number; // 0-indexed
  serverRowsPerPage?: number;
  onServerPageChange?: (page: number) => void;
  onServerRowsPerPageChange?: (pageSize: number) => void;
  serverSortBy?: string;
  serverSortOrder?: "asc" | "desc";
  onServerSortChange?: (columnId: string, order: "asc" | "desc") => void;
}

const ACTIONS_COLUMN_ID = "__actions";

// Generic, reusable table wrapper around @tanstack/react-table. Provides sorting,
// client pagination, column visibility, sticky header, responsive overflow, row
// actions and built-in loading/empty/error states — so feature tables are just a
// `columns` definition.
export default function DataTable<TData>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  emptyIcon,
  enableSorting = true,
  enablePagination = true,
  enableColumnVisibility = false,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  stickyHeader = true,
  maxHeight,
  dense = false,
  fillHeight = false,
  rowActions,
  onRowClick,
  getRowId,
  ariaLabel = "Data table",
  serverRowCount,
  serverPage,
  serverRowsPerPage,
  onServerPageChange,
  onServerRowsPerPageChange,
  serverSortBy,
  serverSortOrder,
  onServerSortChange,
}: DataTableProps<TData>) {
  const [colMenuAnchor, setColMenuAnchor] = useState<null | HTMLElement>(null);

  // Append a trailing actions column when row actions are supplied.
  const allColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!rowActions) return columns;
    const actionsColumn: ColumnDef<TData> = {
      id: ACTIONS_COLUMN_ID,
      header: "",
      enableSorting: false,
      enableHiding: false,
      meta: { align: "right" } satisfies DataTableColumnMeta,
      cell: ({ row }) => rowActions(row.original),
    };
    return [...columns, actionsColumn];
  }, [columns, rowActions]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own memoization internally.
  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableSorting,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const colCount = allColumns.length;

  // --- async states -------------------------------------------------------
  if (loading) {
    return <LoadingSkeleton variant="table" rows={Math.min(pageSize, 8)} columns={colCount} />;
  }
  if (error) {
    return (
      <Paper variant="outlined">
        <ErrorState description={error} onRetry={onRetry} />
      </Paper>
    );
  }
  if (data.length === 0) {
    return (
      <Paper variant="outlined">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          icon={emptyIcon}
        />
      </Paper>
    );
  }

  // --- content ------------------------------------------------------------
  const hideableColumns = table.getAllLeafColumns().filter((c) => c.getCanHide());

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        // Grow as a flex child (parent must be a flex column) rather than via
        // height:100%, which wouldn't resolve against a min-height-sized parent.
        ...(fillHeight && {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }),
      }}
    >
      {enableColumnVisibility && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1.5, pt: 1 }}>
          <Tooltip title="Show / hide columns">
            <IconButton
              size="small"
              aria-label="Show or hide columns"
              onClick={(e: MouseEvent<HTMLElement>) => setColMenuAnchor(e.currentTarget)}
            >
              <MdViewColumn size={20} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={colMenuAnchor}
            open={Boolean(colMenuAnchor)}
            onClose={() => setColMenuAnchor(null)}
          >
            {hideableColumns.map((column) => {
              const header = column.columnDef.header;
              const label = typeof header === "string" && header ? header : column.id;
              return (
                <MenuItem key={column.id} onClick={() => column.toggleVisibility()} dense>
                  <Checkbox size="small" checked={column.getIsVisible()} sx={{ p: 0.5, mr: 1 }} />
                  <ListItemText primary={label} />
                </MenuItem>
              );
            })}
          </Menu>
        </Box>
      )}

      <TableContainer sx={{ maxHeight, ...(fillHeight && { flex: 1 }) }}>
        <Table stickyHeader={stickyHeader} size={dense ? "small" : "medium"} aria-label={ariaLabel}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const sorted = serverSortBy !== undefined
                    ? (serverSortBy === header.id ? serverSortOrder : false)
                    : header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <TableCell
                      key={header.id}
                      align={meta?.align ?? "left"}
                      sortDirection={sorted || false}
                      sx={{ width: meta?.width }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <TableSortLabel
                          active={Boolean(sorted)}
                          direction={sorted === "desc" ? "desc" : "asc"}
                          onClick={() => {
                            if (onServerSortChange) {
                              const nextOrder = sorted === "asc" ? "desc" : "asc";
                              onServerSortChange(header.id, nextOrder);
                            } else {
                              header.column.getToggleSortingHandler()?.(null as any);
                            }
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                sx={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                  return (
                    <TableCell key={cell.id} align={meta?.align ?? "left"}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {enablePagination && (
        <TablePagination
          component="div"
          count={serverRowCount !== undefined ? serverRowCount : table.getFilteredRowModel().rows.length}
          page={serverPage !== undefined ? serverPage : table.getState().pagination.pageIndex}
          rowsPerPage={serverRowsPerPage !== undefined ? serverRowsPerPage : table.getState().pagination.pageSize}
          rowsPerPageOptions={[...pageSizeOptions]}
          onPageChange={(_, page) => {
            if (onServerPageChange) {
              onServerPageChange(page);
            } else {
              table.setPageIndex(page);
            }
          }}
          onRowsPerPageChange={(e) => {
            const size = Number(e.target.value);
            if (onServerRowsPerPageChange) {
              onServerRowsPerPageChange(size);
            } else {
              table.setPageSize(size);
            }
          }}
        />
      )}
    </Paper>
  );
}
