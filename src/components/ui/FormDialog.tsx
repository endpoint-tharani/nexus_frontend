import type { FormEvent, ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import type { Breakpoint } from "@mui/material/styles";
import { MdClose } from "react-icons/md";

export interface FormDialogProps {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  /** Submit handler. When provided, the content is wrapped in a <form>. */
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  /** Hide the footer entirely (caller renders its own actions in children). */
  hideActions?: boolean;
  maxWidth?: Breakpoint | false;
}

// Standard create/edit modal container. The footer's submit button is `type=submit`,
// so it triggers the wrapped form — pair it with react-hook-form's handleSubmit.
export default function FormDialog({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  submitDisabled = false,
  hideActions = false,
  maxWidth = "sm",
}: FormDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle
        id="form-dialog-title"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
      >
        {title}
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          aria-label="Close"
          edge="end"
        >
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>{children}</DialogContent>
        {!hideActions && (
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} disabled={loading} color="inherit">
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || submitDisabled}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {submitLabel}
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
}
