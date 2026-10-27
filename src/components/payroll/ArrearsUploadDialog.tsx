import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { MdUploadFile, MdFileDownload, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys";
import {
  downloadArrearsTemplate,
  getArrearsList,
} from "../../api/payroll.api";
import { useUploadArrears } from "../../hooks/payroll/useArrearsUpload";
import {
  MAX_UPLOAD_BYTES,
  MONTHS,
  SPREADSHEET_ACCEPT,
  SPREADSHEET_MIME_TYPES,
} from "../../constants/app";
import { downloadXlsx } from "../../utils/download";
import { getErrorMessage } from "../../utils/errorHandler";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { formatNumber, getMonthName, toNumber } from "../../utils";
import { ConfirmDialog } from "../ui";
import type { UploadArrearsResult } from "../../types";

export interface ArrearsUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const ALLOWED_EXTENSIONS = [".xls", ".xlsx"];
const CURRENT_YEAR = new Date().getFullYear();

const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR + 1 - i;
  return { value: y, label: `${y}-${y + 1}` };
});

const humanSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const validateFile = (file: File): string | null => {
  const name = file.name.toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mimeOk = (SPREADSHEET_MIME_TYPES as readonly string[]).includes(
    file.type
  );
  if (!extOk && !mimeOk) {
    return "Unsupported file type. Upload a .xls or .xlsx file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large. Maximum size is ${humanSize(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
};

export default function ArrearsUploadDialog({
  open,
  onClose,
}: ArrearsUploadDialogProps) {
  const companyId = useCompanyId();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Form states
  const currentMonth = new Date().getMonth(); // 0-11
  const defaultFyStartYear = currentMonth < 3 ? CURRENT_YEAR - 1 : CURRENT_YEAR;

  const [fyStartYear, setFyStartYear] = useState<number>(defaultFyStartYear);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadArrearsResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadTime, setUploadTime] = useState<string | null>(null);

  // Keep track of parameters submitted for post-upload calculations
  const [submittedPeriod, setSubmittedPeriod] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const uploadMutation = useUploadArrears();

  const handleClose = () => {
    if (uploadMutation.isPending) return;
    setFile(null);
    setFileError(null);
    setFyStartYear(defaultFyStartYear);
    setMonth(new Date().getMonth() + 1);
    setUploadResult(null);
    setShowSummary(false);
    setUploadTime(null);
    setSubmittedPeriod(null);
    onClose();
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!selected) return;

    const error = validateFile(selected);
    if (error) {
      setFile(null);
      setFileError(error);
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const handleDownloadTemplate = async () => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setDownloadingTemplate(true);
    try {
      const res = await downloadArrearsTemplate(companyId);
      downloadXlsx(res.data, "arrears-upload-template");
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const resolveCalendarPeriod = (fyStart: number, m: number) => {
    // If month is Jan, Feb, Mar (1, 2, 3), actual year is fyStart + 1
    // If month is Apr-Dec (4-12), actual year is fyStart
    const year = m <= 3 ? fyStart + 1 : fyStart;
    return { year, month: m };
  };

  const handleUploadClick = () => {
    if (!file) {
      setFileError("Please select a file to upload.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!file || !companyId) return;
    setConfirmOpen(false);

    const { year: calYear, month: calMonth } = resolveCalendarPeriod(fyStartYear, month);
    setSubmittedPeriod({ year: calYear, month: calMonth });

    uploadMutation.mutate(
      {
        file,
        year: calYear,
        month: calMonth,
      },
      {
        onSuccess: (result) => {
          setUploadResult(result);
          setUploadTime(new Date().toLocaleTimeString());
          setShowSummary(true);
          toast.success(`Arrears uploaded: ${result.processed} processed`);
        },
        onError: (err) => {
          setFileError(getErrorMessage(err));
        },
      }
    );
  };

  // Fetch arrears for this period to calculate total amount dynamically for Success Summary
  const { data: currentArrears = [] } = useQuery({
    queryKey: [...queryKeys.payroll.all(companyId ?? ""), "arrears", submittedPeriod ?? {}],
    queryFn: async () => {
      if (!companyId || !submittedPeriod) return [];
      const res = await getArrearsList(companyId, submittedPeriod);
      return res.data.data;
    },
    enabled: !!companyId && !!submittedPeriod && showSummary,
  });

  const totalArrearsAmount = currentArrears.reduce(
    (sum, item) => sum + (toNumber(item.amount) ?? 0),
    0
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {showSummary ? "Success Summary" : "Upload Arrears Salary Sheet"}
        </DialogTitle>
        <DialogContent dividers>
          {showSummary && uploadResult ? (
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MdCheckCircle size={36} color="var(--mui-palette-success-main, #2e7d32)" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                  Upload Completed Successfully
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Payroll Month</TableCell>
                      <TableCell>
                        {submittedPeriod
                          ? `${getMonthName(submittedPeriod.month)} ${submittedPeriod.year}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total Records</TableCell>
                      <TableCell>{uploadResult.processed + uploadResult.skipped}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Uploaded Records</TableCell>
                      <TableCell sx={{ color: "success.main", fontWeight: 600 }}>
                        {uploadResult.processed}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Failed Records</TableCell>
                      <TableCell sx={{ color: uploadResult.skipped > 0 ? "error.main" : "text.secondary" }}>
                        {uploadResult.skipped}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total Arrear Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₹{formatNumber(totalArrearsAmount)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Upload Time</TableCell>
                      <TableCell>{uploadTime || "—"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "error.main", mb: 1 }}>
                    Validation Failures ({uploadResult.errors.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 180, overflowY: "auto" }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>Employee Code</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadResult.errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{err.sourceRow}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{err.employeeCode}</TableCell>
                            <TableCell sx={{ color: "error.main" }}>{err.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "warning.main", mb: 0.5 }}>
                    Warnings
                  </Typography>
                  <Alert severity="warning" sx={{ py: 0.5 }}>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {uploadResult.warnings.map((w, i) => (
                        <li key={i}>
                          <Typography variant="caption">{w}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </Box>
              )}
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Financial Year"
                  size="small"
                  value={fyStartYear}
                  onChange={(e) => setFyStartYear(Number(e.target.value))}
                  fullWidth
                  disabled={uploadMutation.isPending}
                >
                  {FY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Payroll Month"
                  size="small"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  fullWidth
                  disabled={uploadMutation.isPending}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Spreadsheet Instructions
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    <li style={{ marginBottom: 4 }}>
                      Columns must include <strong>Employee Code</strong> and <strong>Arrear</strong>.
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      All other columns will be ignored. Only arrears data will be uploaded.
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      Employee codes must match active profiles exactly.
                    </li>
                  </ul>
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<MdFileDownload />}
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate || uploadMutation.isPending}
                >
                  {downloadingTemplate ? "Downloading..." : "Download Template"}
                </Button>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<MdUploadFile />}
                  disabled={uploadMutation.isPending}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept={SPREADSHEET_ACCEPT}
                    onChange={handleSelect}
                  />
                </Button>
                {file && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {file.name} ({humanSize(file.size)})
                  </Typography>
                )}
              </Box>

              {fileError && <Alert severity="error">{fileError}</Alert>}

              {uploadMutation.isPending && (
                <Box>
                  <LinearProgress />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1, textAlign: "center" }}
                  >
                    Uploading file and registering arrears...
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {showSummary ? (
            <Button onClick={handleClose} variant="contained" color="primary">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={handleClose} disabled={uploadMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadClick}
                variant="contained"
                disabled={!file || uploadMutation.isPending}
                startIcon={
                  uploadMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                Upload
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog before upload */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Arrears Upload"
        message={
          <>
            Are you sure you want to upload the arrears spreadsheet for{" "}
            <strong>
              {MONTHS.find((m) => m.value === month)?.label}{" "}
              {resolveCalendarPeriod(fyStartYear, month).year}
            </strong>
            ? This will upsert the arrears ledger records and sync employees' tax declarations.
          </>
        }
        confirmLabel="Upload"
        onConfirm={handleConfirmUpload}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
