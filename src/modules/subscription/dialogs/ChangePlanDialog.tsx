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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import toast from "react-hot-toast";
import { useChangePlanSubscription, useSubscriptionPlans } from "../hooks/useSubscriptionAdmin";
import { getErrorMessage } from "../../../utils";

interface ChangePlanDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  currentPlanCode?: string;
  onSuccess?: () => void;
}

export default function ChangePlanDialog({
  open,
  onClose,
  companyId,
  companyName,
  currentPlanCode,
  onSuccess,
}: ChangePlanDialogProps) {
  const { data: plans = [] } = useSubscriptionPlans();
  const changePlanMutation = useChangePlanSubscription();

  const [planCode, setPlanCode] = useState("");
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setPlanCode("");
    setReason("");
    onClose();
  };

  const handleChangePlan = () => {
    if (!planCode) {
      toast.error("Please select a new plan");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for the plan change");
      return;
    }

    changePlanMutation.mutate(
      { companyId, planCode, reason },
      {
        onSuccess: () => {
          toast.success("Subscription plan updated successfully.");
          if (onSuccess) onSuccess();
          handleClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const availablePlans = plans.filter((p) => p.isActive && p.code !== currentPlanCode);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Change Subscription Plan
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Manually upgrade or downgrade the plan for <strong>{companyName}</strong>. The remaining subscription period will be preserved under the new plan.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="change-plan-select-label">New Plan</InputLabel>
            <Select
              labelId="change-plan-select-label"
              value={planCode}
              label="New Plan"
              onChange={(e) => setPlanCode(e.target.value)}
            >
              {availablePlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.code}>
                  {plan.name}
                </MenuItem>
              ))}
              {availablePlans.length === 0 && (
                <MenuItem disabled value="">
                  No other active plans available
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Reason for Change"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client requested upgrade to Full Suite"
            required
            multiline
            rows={2}
            fullWidth
            error={reason.trim() === "" && changePlanMutation.isPending}
            helperText="Provide context for this upgrade/downgrade to store in the audit logs."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={changePlanMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleChangePlan}
          variant="contained"
          color="primary"
          disabled={!planCode || !reason.trim() || changePlanMutation.isPending}
          startIcon={
            changePlanMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Change Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
