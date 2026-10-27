import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import HistoryToggleOffOutlinedIcon from "@mui/icons-material/HistoryToggleOffOutlined";

import { useTdsHistory } from "../../hooks/payroll";
import { MoneyText, StatusChip } from "../ui";
import SectionHeader from "./SectionHeader";

const FULL_MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface TdsHistorySectionProps {
  employeeId: string;
  year: number;
}

export default function TdsHistorySection({
  employeeId,
  year,
}: TdsHistorySectionProps) {
  const { data: history, isLoading, isError } = useTdsHistory(employeeId, year);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError || !history) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, textAlign: "center", borderColor: "divider" }}
      >
        <Typography color="error" variant="body2">
          Failed to load TDS deduction history.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: "none",
        borderRadius: "10px",
        overflow: "hidden",
        mt: 3,
      }}
    >
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <SectionHeader
          icon={<HistoryToggleOffOutlinedIcon />}
          title="TDS Deduction History"
          subtitle="Chronological record of monthly salary TDS uploads"
        />
      </Box>

      {history.length === 0 ? (
        <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No TDS deduction history found for this financial year.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default" }}>
              <TableRow>
                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Payroll Month</TableCell>
                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>Payroll Run</TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 600 }}>
                  TDS Deducted
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 600 }}>
                  Running Total
                </TableCell>
                <TableCell align="center" sx={{ py: 1.5, fontWeight: 600 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row, idx) => {
                const monthName = FULL_MONTH_LABELS[row.month - 1] ?? `Month ${row.month}`;
                // Format runId to a short user-friendly code like Payroll Run PR-XXXX
                const runCode = `Payroll Run #${row.runId.slice(-4).toUpperCase()}`;

                return (
                  <TableRow
                    key={`${row.runId}-${row.month}-${idx}`}
                    sx={{
                      "&:last-child td": { border: 0 },
                      hover: { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>{monthName}</TableCell>
                    <TableCell sx={{ py: 2, color: "text.secondary", fontFamily: "monospace" }}>
                      {runCode}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <MoneyText value={row.tdsAmount} sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <MoneyText value={row.runningTotal} sx={{ fontWeight: 600, color: "primary.main" }} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <StatusChip status="PAID" kind="payroll" size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
