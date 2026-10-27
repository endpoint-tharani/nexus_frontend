import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { MdUploadFile, MdFileDownload } from "react-icons/md";
import toast from "react-hot-toast";

import { useQueryClient } from "@tanstack/react-query";
import {
  downloadSalaryImportTemplate,
  uploadSalaryImportFile,
  registerSalaryImport,
  previewPayroll,
} from "../../api/payroll.api";
import { queryKeys } from "../../constants/queryKeys";
import {
  MAX_UPLOAD_BYTES,
  MONTHS,
  SPREADSHEET_ACCEPT,
  SPREADSHEET_MIME_TYPES,
} from "../../constants/app";
import { downloadXlsx } from "../../utils/download";
import { getErrorMessage } from "../../utils/errorHandler";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { formatNumber } from "../../utils";
import type { SalaryImportType, PreviewPayrollResult } from "../../types";

export interface SalaryImportDialogProps {
  open: boolean;
  onClose: () => void;
  type: SalaryImportType;
}

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];
const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 1 - i);
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
    return "Unsupported file type. Upload a .xlsx, .xls or .csv file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large. Maximum size is ${humanSize(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
};

export default function SalaryImportDialog({
  open,
  onClose,
  type,
}: SalaryImportDialogProps) {
  const companyId = useCompanyId();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Form states
  const currentMonth = new Date().getMonth();
  const defaultFyStartYear = currentMonth < 3 ? CURRENT_YEAR - 1 : CURRENT_YEAR;

  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [salaryType, setSalaryType] = useState<"REGULAR" | "ARREARS">("REGULAR");
  const [fyStartYear, setFyStartYear] = useState<number>(defaultFyStartYear);
  const [replace, setReplace] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const [previewResult, setPreviewResult] = useState<PreviewPayrollResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);

  const isSalary = type === "SALARY";
  const isPending = loadingPreview || registering;

  const title =
    type === "SALARY"
      ? "Upload Salary Sheet"
      : type === "BONUS"
      ? "Upload Bonus Sheet"
      : "Upload Incentive Sheet";

  const resetAll = () => {
    setFile(null);
    setFileError(null);
    setYear(CURRENT_YEAR);
    setMonth(new Date().getMonth() + 1);
    setSalaryType("REGULAR");
    setFyStartYear(defaultFyStartYear);
    setReplace(false);
    setPreviewResult(null);
    setUploadedKey(null);
  };

  const handleClose = () => {
    if (isPending) return;
    resetAll();
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
    setPreviewResult(null);
    setUploadedKey(null);
  };

  const handleDownloadTemplate = async () => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setDownloadingTemplate(true);
    try {
      const res = await downloadSalaryImportTemplate(companyId, type);
      const filename =
        type === "SALARY"
          ? "salary_template"
          : type === "BONUS"
          ? "bonus_template"
          : "incentive_template";
      downloadXlsx(res.data, filename);
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setFileError("Please choose a spreadsheet to upload.");
      return;
    }
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }

    setLoadingPreview(true);
    setFileError(null);
    try {
      const fileRes = await uploadSalaryImportFile(companyId, type, file);
      const data = fileRes.data.data;
      let sourceFileKey = "";
      if (data.sourceFileKey) {
        sourceFileKey = data.sourceFileKey;
      } else if (data.fileKey) {
        sourceFileKey = data.fileKey;
      } else if (data.key) {
        sourceFileKey = data.key;
      } else {
        throw new Error("No file key returned from upload API");
      }
      setUploadedKey(sourceFileKey);

      if (isSalary) {
        const previewRes = await previewPayroll(companyId, sourceFileKey);
        setPreviewResult(previewRes.data.data);
        toast.success("Spreadsheet parsed successfully. Please verify the preview below.");
      } else {
        // For BONUS / INCENTIVE directly finalize as there is no specific preview required.
        // Or we can let them click Confirm Import.
        toast.success("Spreadsheet uploaded successfully. Click Import to finalize.");
      }
    } catch (error) {
      setFileError(getErrorMessage(error));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!companyId || !uploadedKey) return;
    setRegistering(true);
    try {
      const payload = isSalary
        ? { year, month, salaryType, uploadType: "SALARY", sourceFileKey: uploadedKey, replace }
        : { fyStartYear, sourceFileKey: uploadedKey };

      const res = await registerSalaryImport(companyId, type, payload);
      const summary = res.data.data;

      const created = summary.created ?? 0;
      const skipped = summary.skipped ?? 0;
      const summaryText = [`${created} ${created === 1 ? "entry" : "entries"} created`];
      if (skipped > 0) summaryText.push(`${skipped} skipped`);
      toast.success(`${type} uploaded — ${summaryText.join(", ")}`);

      const unmatched = summary.unmatchedEmployeeCodes ?? [];
      if (unmatched.length > 0) {
        const preview = unmatched.slice(0, 5).join(", ");
        const more = unmatched.length > 5 ? `, +${unmatched.length - 5} more` : "";
        toast.error(
          `${unmatched.length} row(s) skipped — unmatched employee codes: ${preview}${more}`,
          { duration: 8000 }
        );
      }
      const warnings = summary.warnings ?? [];
      if (warnings.length > 0) {
        toast(`${warnings.length} warning(s): ${warnings.slice(0, 3).join("; ")}`, {
          icon: "⚠️",
          duration: 8000,
        });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myTaxStructured.all(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myTax.all(companyId) });

      resetAll();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {isSalary ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Year"
                  size="small"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  fullWidth
                  disabled={isPending}
                >
                  {YEAR_OPTIONS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Month"
                  size="small"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  fullWidth
                  disabled={isPending}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                select
                label="Salary Type"
                size="small"
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value as "REGULAR" | "ARREARS")}
                fullWidth
                disabled={isPending}
              >
                <MenuItem value="REGULAR">Regular Salary</MenuItem>
                <MenuItem value="ARREARS">Arrears Salary</MenuItem>
              </TextField>
            </Stack>
          ) : (
            <TextField
              select
              label="Financial Year"
              size="small"
              value={fyStartYear}
              onChange={(e) => setFyStartYear(Number(e.target.value))}
              fullWidth
              disabled={isPending}
            >
              {FY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {isSalary && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={replace}
                  onChange={(e) => setReplace(e.target.checked)}
                  disabled={isPending}
                />
              }
              label="Overwrite existing upload for this period"
            />
          )}

          {!isSalary && (
            <Alert severity="warning">
              Uploading a new file will overwrite any existing {type.toLowerCase()} entries for the selected financial year.
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Spreadsheet Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {type === "SALARY" && (
                  <>
                    <li style={{ marginBottom: 4 }}>
                      Columns must include <strong>employeeCode</strong>.
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      Include component columns (e.g. BASIC, HRA, PF) which map to active salary components.
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      Ensure you include summary columns <strong>gross</strong>, <strong>totalDeductions</strong>, and <strong>netPay</strong>.
                    </li>
                  </>
                )}
                {(type === "BONUS" || type === "INCENTIVE") && (
                  <>
                    <li style={{ marginBottom: 4 }}>
                      Columns must include <strong>employeeCode</strong> and <strong>amount</strong>.
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      The amount must represent the annual amount for this {type === "BONUS" ? "bonus" : "incentive"}.
                    </li>
                  </>
                )}
                <li>Employee codes must match active profiles exactly.</li>
              </ul>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MdFileDownload />}
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate || isPending}
            >
              {downloadingTemplate ? "Downloading..." : "Download Template"}
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<MdUploadFile />}
              disabled={isPending}
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

          {loadingPreview && (
            <Box>
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                Uploading file and parsing preview...
              </Typography>
            </Box>
          )}

          {registering && (
            <Box>
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                Saving payroll import...
              </Typography>
            </Box>
          )}

          {previewResult && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Import Preview ({previewResult.rows.length} rows)
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Gross Salary</TableCell>
                      <TableCell align="right">Imported TDS</TableCell>
                      <TableCell align="right">Net Salary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewResult.rows.map((row, idx) => (
                      <TableRow key={`${row.employeeCode}-${idx}`}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.employeeCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(row.gross)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {formatNumber(row.tds)}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(row.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {previewResult.warnings && previewResult.warnings.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Warnings ({previewResult.warnings.length})
                  </Typography>
                  <Alert severity="warning" sx={{ py: 0 }}>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {previewResult.warnings.slice(0, 5).map((w, i) => (
                        <li key={i}>
                          <Typography variant="caption">{w}</Typography>
                        </li>
                      ))}
                      {previewResult.warnings.length > 5 && (
                        <li>
                          <Typography variant="caption">and {previewResult.warnings.length - 5} more...</Typography>
                        </li>
                      )}
                    </ul>
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        {!uploadedKey ? (
          <Button
            onClick={handlePreview}
            variant="contained"
            disabled={!file || isPending}
          >
            Preview & Verify
          </Button>
        ) : (
          <Button
            onClick={handleConfirmImport}
            variant="contained"
            color="success"
            disabled={isPending}
          >
            Confirm Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
