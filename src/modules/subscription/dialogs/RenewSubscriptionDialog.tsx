import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useRenewSubscription } from "../hooks/useSubscriptionAdmin";
import { getErrorMessage } from "../../../utils";

interface RenewSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  currentPlanCode: string;
  currentPlanName: string;
  currentExpiryDate: string | null;
  onSuccess?: (durationMonths: number) => void;
}

export default function RenewSubscriptionDialog({
  open,
  onClose,
  companyId,
  companyName,
  currentPlanCode,
  currentPlanName,
  currentExpiryDate,
  onSuccess,
}: RenewSubscriptionDialogProps) {
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const renewMutation = useRenewSubscription();

  const handleClose = () => {
    setDurationMonths(1);
    onClose();
  };

  const handleRenew = () => {
    renewMutation.mutate(
      {
        companyId,
        durationMonths,
      },
      {
        onSuccess: () => {
          toast.success("Subscription renewed successfully");
          if (onSuccess) onSuccess(durationMonths);
          handleClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  // Expiry calculation:
  // If the current expiry date is in the future, extend it.
  // Otherwise, start from today.
  const today = dayjs();
  const currentExpiry = currentExpiryDate ? dayjs(currentExpiryDate) : null;
  const baseDate = currentExpiry && currentExpiry.isAfter(today) ? currentExpiry : today;
  const newExpiryDate = baseDate.add(durationMonths, "month").format("DD MMM YYYY");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Renew Subscription</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Provision extension for <strong>{companyName}</strong>.
          </Typography>

          <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Current Plan
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currentPlanName} ({currentPlanCode})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Current Expiry
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currentExpiryDate ? dayjs(currentExpiryDate).format("DD MMM YYYY") : "Lapsed / None"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <FormControl fullWidth required>
            <InputLabel id="renew-duration-label">Extension Duration</InputLabel>
            <Select
              labelId="renew-duration-label"
              value={durationMonths}
              label="Extension Duration"
              onChange={(e) => setDurationMonths(Number(e.target.value))}
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </Select>
          </FormControl>

          <Card variant="outlined" sx={{ borderStyle: "dashed", borderColor: "primary.main", bgcolor: "rgba(37, 99, 235, 0.02)" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                New Calculated Expiry
              </Typography>
              <Typography variant="body1" color="primary.main" sx={{ fontWeight: 700 }}>
                {newExpiryDate}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={renewMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleRenew}
          variant="contained"
          disabled={renewMutation.isPending}
          startIcon={
            renewMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Renew Subscription
        </Button>
      </DialogActions>
    </Dialog>
  );
}
