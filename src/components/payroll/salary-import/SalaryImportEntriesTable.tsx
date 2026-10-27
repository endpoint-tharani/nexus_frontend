import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdEdit, MdReceiptLong, MdDeleteOutline, MdLock } from "react-icons/md";
import { useSalaryImportDetails } from "../../../hooks/payroll/useSalaryImportDetails";
import type { PayrollEntry } from "../../../types";
import { formatCurrency } from "../../../utils/format";

export interface SalaryImportEntriesTableProps {
  onEditEntry: (entry: PayrollEntry) => void;
  onViewStatement: (entry: PayrollEntry) => void;
  onDeleteEntry: (entry: PayrollEntry) => void;
  canManage?: boolean;
}

const stickyColSx = {
  position: "sticky" as const,
  left: 0,
  zIndex: 2,
  bgcolor: "background.paper",
  borderRight: "1px solid",
  borderRightColor: "divider",
  whiteSpace: "nowrap" as const,
  minWidth: 160,
  width: 160,
};

const stickyHeaderColSx = {
  position: "sticky" as const,
  left: 0,
  top: 0,
  zIndex: 3,
  bgcolor: "background.paper",
  borderRight: "1px solid",
  borderRightColor: "divider",
  whiteSpace: "nowrap" as const,
  minWidth: 160,
  width: 160,
};

const employeeLabel = (entry: PayrollEntry) =>
  entry.employeeName ?? entry.employeeCode ?? entry.employeeId;

export default function SalaryImportEntriesTable({
  onEditEntry,
  onViewStatement,
  onDeleteEntry,
  canManage = true,
}: SalaryImportEntriesTableProps) {
  const {
    isSalary,
    paginatedEntries: entries,
    allComponents,
    entryTotals,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  } = useSalaryImportDetails();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%" }}>
      <TableContainer
        component={Box}
        sx={{
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            "&:hover": {
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.35)"
                  : "rgba(0, 0, 0, 0.35)",
            },
          },
          "& .MuiTableCell-root": {
            padding: "5px 8px", // Super compact padding for high dense rows
            fontSize: "13px",
          },
          "& .MuiTableCell-head": {
            py: 0.75,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            bgcolor: "background.paper",
          },
        }}
      >
        {isSalary ? (
          <Table size="small" sx={{ minWidth: 720 }} stickyHeader>
            <TableHead sx={{ bgcolor: "background.paper" }}>
              <TableRow>
                <TableCell sx={{ ...stickyHeaderColSx, fontWeight: 700 }}>Employee</TableCell>
                
                {allComponents.earnings.map((e) => (
                  <TableCell
                    key={e.code}
                    align="right"
                    sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}
                  >
                    {e.name}
                  </TableCell>
                ))}
                
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}>
                  Gross
                </TableCell>
                
                {allComponents.deductions.map((d) => (
                  <TableCell
                    key={d.code}
                    align="right"
                    sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}
                  >
                    {d.name}
                  </TableCell>
                ))}

                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}>
                  Deductions
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}>
                  Net
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}>
                  Days
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap", bgcolor: "background.paper" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6 + allComponents.earnings.length + allComponents.deductions.length}
                    sx={{ py: 5, textAlign: "center" }}
                  >
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                      No entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => {
                  const t = entryTotals(entry);
                  const compMap = new Map<string, number>();
                  (entry.components ?? []).forEach((c) => {
                    compMap.set(c.code, Number(c.amount) || 0);
                  });

                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={stickyColSx}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ fontWeight: 600 }}
                          >
                            {entry.employeeName ?? "—"}
                          </Typography>
                          {entry.locked && (
                            <Tooltip title="Locked — read-only">
                              <Box component="span" sx={{ display: "inline-flex", color: "text.disabled" }}>
                                <MdLock size={14} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {entry.employeeCode ?? entry.employeeId}
                        </Typography>
                      </TableCell>

                      {allComponents.earnings.map((e) => {
                        const val = compMap.get(e.code) ?? 0;
                        return (
                          <TableCell key={e.code} align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {val > 0 ? formatCurrency(val) : "–"}
                          </TableCell>
                        );
                      })}

                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(t.gross)}
                      </TableCell>

                      {allComponents.deductions.map((d) => {
                        const val = compMap.get(d.code) ?? 0;
                        return (
                          <TableCell
                            key={d.code}
                            align="right"
                            sx={{
                              fontVariantNumeric: "tabular-nums",
                              color: val > 0 ? "error.main" : "text.secondary",
                            }}
                          >
                            {val > 0 ? formatCurrency(val) : "–"}
                          </TableCell>
                        );
                      })}

                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(t.deductions)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 600, color: "text.primary", fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatCurrency(t.net)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {entry.daysInMonth ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          {canManage && (
                            <Tooltip title={entry.locked ? "Entry is locked" : "Edit entry"}>
                              <span>
                                <IconButton
                                  size="small"
                                  aria-label={`Edit entry for ${employeeLabel(entry)}`}
                                  onClick={() => onEditEntry(entry)}
                                  disabled={entry.locked}
                                  sx={{ color: "primary.main" }}
                                >
                                  <MdEdit size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          <Tooltip title="Pay statement">
                            <IconButton
                              size="small"
                              aria-label={`Pay statement for ${employeeLabel(entry)}`}
                              onClick={() => onViewStatement(entry)}
                              sx={{ color: "secondary.main" }}
                            >
                              <MdReceiptLong size={18} />
                            </IconButton>
                          </Tooltip>
                          {canManage && (
                            <Tooltip title={entry.locked ? "Entry is locked" : "Delete entry"}>
                              <span>
                                <IconButton
                                  size="small"
                                  aria-label={`Delete entry for ${employeeLabel(entry)}`}
                                  onClick={() => onDeleteEntry(entry)}
                                  disabled={entry.locked}
                                  sx={{ color: "error.main" }}
                                >
                                  <MdDeleteOutline size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Employee Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 5, textAlign: "center" }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                      No entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry: any) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {entry.employeeCode || entry.employee?.employeeCode}
                    </TableCell>
                    <TableCell>
                      {entry.employeeName || entry.employee?.name}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(entry.grossSalary ?? entry.netPay ?? 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ flexShrink: 0 }}
      />
    </Box>
  );
}
