import type { ReactNode } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export type ConfirmSeverity = "error" | "warning" | "primary" | "info" | "success";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Color of the confirm button (default "error" for destructive actions). */
  severity?: ConfirmSeverity;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Reusable confirmation dialog for destructive / irreversible actions. Owns no
// business logic — the caller passes `loading` (mutation pending) and handlers.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  severity = "error",
  confirmDisabled = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      {message && (
        <DialogContent>
          <DialogContentText component="div" color="text.secondary">
            {message}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: message ? 0 : 1 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity}
          disabled={loading || confirmDisabled}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
