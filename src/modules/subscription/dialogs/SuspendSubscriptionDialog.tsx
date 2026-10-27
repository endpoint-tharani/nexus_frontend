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
import { useSuspendSubscription } from "../hooks/useSubscriptionAdmin";
import { getErrorMessage } from "../../../utils";

interface SuspendSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

export default function SuspendSubscriptionDialog({
  open,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: SuspendSubscriptionDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const suspendMutation = useSuspendSubscription();

  const handleClose = () => {
    setReason("");
    setConfirmCheckbox(false);
    onClose();
  };

  const handleSuspend = () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for suspension");
      return;
    }
    if (!confirmCheckbox) {
      toast.error("Please confirm that you understand the terms");
      return;
    }

    suspendMutation.mutate(
      { companyId, reason },
      {
        onSuccess: () => {
          toast.success("Subscription suspended successfully.");
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
      <DialogTitle sx={{ fontWeight: 700, color: "warning.main" }}>
        Suspend Subscription
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Alert severity="warning" sx={{ fontWeight: 500 }}>
            WARNING: Suspending access halts active service logins.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            You are about to manually suspend the active subscription for{" "}
            <strong>{companyName}</strong>.
          </Typography>

          <TextField
            label="Reason for Suspension"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Awaiting offline payment verification, temporary hold"
            required
            multiline
            rows={2}
            fullWidth
            error={reason.trim() === "" && suspendMutation.isPending}
            helperText="A reason is required to document this action in the audit logs."
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I understand this temporarily disables system access for this company until reactivated.
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={suspendMutation.isPending}>
          Back
        </Button>
        <Button
          onClick={handleSuspend}
          variant="contained"
          color="warning"
          disabled={!confirmCheckbox || !reason.trim() || suspendMutation.isPending}
          startIcon={
            suspendMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Suspend Access
        </Button>
      </DialogActions>
    </Dialog>
  );
}
