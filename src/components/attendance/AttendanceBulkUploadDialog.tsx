import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { MdUploadFile } from "react-icons/md";
import toast from "react-hot-toast";

import { useBulkUploadAttendance } from "../../hooks/attendance";
import {
  MAX_UPLOAD_BYTES,
  SPREADSHEET_ACCEPT,
  SPREADSHEET_MIME_TYPES,
} from "../../constants/app";
import type { BulkMarkResult } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

export interface AttendanceBulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const humanSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Browser MIME reporting for spreadsheets is unreliable (especially .csv), so
// accept a file if EITHER its MIME type or its extension is in the allow-list.
const validateFile = (file: File): string | null => {
  const name = file.name.toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mimeOk = (SPREADSHEET_MIME_TYPES as readonly string[]).includes(
    file.type
  );
  if (!extOk && !mimeOk) {
    return "Unsupported file type. Upload a .csv, .xls or .xlsx file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large. Maximum size is ${humanSize(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
};

// Self-contained bulk attendance-import dialog. Expects a sheet with columns:
// date, employeeCode (or employeeId), status, checkIn, checkOut, remarks.
export default function AttendanceBulkUploadDialog({
  open,
  onClose,
}: AttendanceBulkUploadDialogProps) {
  const uploadMutation = useBulkUploadAttendance();
  const { isPending } = uploadMutation;

  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkMarkResult | null>(null);

  const reset = () => {
    setFile(null);
    setValidationError(null);
    setResult(null);
    uploadMutation.reset();
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";
    setResult(null);
    if (!selected) return;

    const error = validateFile(selected);
    if (error) {
      setFile(null);
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (summary) => {
        setResult(summary);
        const { processed, skipped } = summary;
        toast.success(
          `Import complete: ${processed} processed` +
            (skipped ? `, ${skipped} skipped` : "")
        );
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Bulk Upload Attendance</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Upload a spreadsheet (.csv, .xls or .xlsx) with columns{" "}
          <strong>date</strong>, <strong>employeeCode</strong> (or employeeId),{" "}
          <strong>status</strong>, and optional <strong>checkIn</strong> /{" "}
          <strong>checkOut</strong> / <strong>remarks</strong>.
        </DialogContentText>

        <Button
          component="label"
          variant="outlined"
          startIcon={<MdUploadFile size={18} />}
          disabled={isPending}
          sx={{ textTransform: "none" }}
        >
          Choose file
          <input
            type="file"
            hidden
            accept={SPREADSHEET_ACCEPT}
            onChange={handleSelect}
          />
        </Button>

        {file && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Selected: <strong>{file.name}</strong> ({humanSize(file.size)})
          </Typography>
        )}

        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}

        {isPending && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Uploading…
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {result && (
          <Alert
            severity={result.skipped > 0 ? "warning" : "success"}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {result.processed} processed
              {result.skipped > 0 ? `, ${result.skipped} skipped` : ""}
            </Typography>
            {result.errors.length > 0 && (
              <List dense sx={{ mt: 0.5, maxHeight: 180, overflowY: "auto" }}>
                {result.errors.map((err, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0 }}>
                    <ListItemText
                      primary={`Row ${err.row + 1}${err.ref ? ` (${err.ref})` : ""}: ${err.message}`}
                      slotProps={{
                        primary: {
                          variant: "caption",
                          color: "text.secondary",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          {result ? "Close" : "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || isPending || !!result}
          sx={{ minWidth: 120 }}
          startIcon={
            isPending ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
