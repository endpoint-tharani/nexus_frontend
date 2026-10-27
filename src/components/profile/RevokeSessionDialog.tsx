import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import toast from "react-hot-toast";

import { useRevokeSession } from "../../hooks/user";
import type { Session } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

export interface RevokeSessionDialogProps {
  open: boolean;
  session: Session | null;
  onClose: () => void;
}

// Self-contained revoke confirmation. Owns the mutation (which invalidates the
// session list) + toasts; the page just toggles `open` and hands it the target.
export default function RevokeSessionDialog({
  open,
  session,
  onClose,
}: RevokeSessionDialogProps) {
  const revokeMutation = useRevokeSession();
  const { isPending } = revokeMutation;

  const handleConfirm = () => {
    if (!session) return;
    revokeMutation.mutate(session.id, {
      onSuccess: () => {
        toast.success("Session revoked");
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Revoke session</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This signs out the selected device immediately. Anyone using it will
          need to sign in again. This action can't be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={isPending}
          sx={{ minWidth: 120 }}
        >
          {isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Revoke"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
