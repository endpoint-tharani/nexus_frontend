import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import toast from "react-hot-toast";
import { useCancelSubscription } from "../hooks/useSubscriptionAdmin";
import { getErrorMessage } from "../../../utils";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

export default function CancelSubscriptionDialog({
  open,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const cancelMutation = useCancelSubscription();

  const handleClose = () => {
    setReason("");
    setConfirmCheckbox(false);
    onClose();
  };

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for cancellation");
      return;
    }
    if (!confirmCheckbox) {
      toast.error("Please confirm that you understand the terms");
      return;
    }

    cancelMutation.mutate(
      { companyId, reason },
      {
        onSuccess: (data) => {
          toast.success(
            `Subscription cancelled successfully. Disabled ${data.disabledModulesCount} module(s).`
          );
          if (onSuccess) onSuccess();
          handleClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
        Cancel Subscription
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Alert severity="error" sx={{ fontWeight: 500 }}>
            WARNING: This is a destructive action.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            You are about to manually cancel the active subscription for{" "}
            <strong>{companyName}</strong>.
          </Typography>

          <TextField
            label="Reason for Cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Non-payment, contract terminated, customer requested"
            required
            multiline
            rows={2}
            fullWidth
            error={reason.trim() === "" && cancelMutation.isPending}
            helperText="A reason is required to document this action in the audit logs."
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I understand this immediately disables all modules and revokes system access for this company.
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={cancelMutation.isPending}>
          Back
        </Button>
        <Button
          onClick={handleCancel}
          variant="contained"
          color="error"
          disabled={!confirmCheckbox || !reason.trim() || cancelMutation.isPending}
          startIcon={
            cancelMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Cancel Subscription
        </Button>
      </DialogActions>
    </Dialog>
  );
}
