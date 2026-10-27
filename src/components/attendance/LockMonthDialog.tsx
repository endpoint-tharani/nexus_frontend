import { useEffect, useState } from "react";
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
  MenuItem,
  TextField,
} from "@mui/material";
import { MdLock, MdLockOpen } from "react-icons/md";
import toast from "react-hot-toast";

import { useLockMonth, useUnlockMonth } from "../../hooks/attendance";
import { MONTHS } from "../../constants/app";
import { getMonthName } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

export interface LockMonthDialogProps {
  open: boolean;
  onClose: () => void;
  defaultMonth: number;
  defaultYear: number;
}

// Build a small selectable calendar-year range around the given year.
const yearOptions = (around: number): number[] =>
  Array.from({ length: 4 }, (_, i) => around - 2 + i);

// Locks/unlocks a payroll month. Locking freezes every attendance row in the
// period so payroll can run against immutable data; unlocking reverses it.
export default function LockMonthDialog({
  open,
  onClose,
  defaultMonth,
  defaultYear,
}: LockMonthDialogProps) {
  const lockMutation = useLockMonth();
  const unlockMutation = useUnlockMonth();
  const pending = lockMutation.isPending || unlockMutation.isPending;

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [reason, setReason] = useState("");

  // Re-seed the period whenever the dialog re-opens for a new selection.
  useEffect(() => {
    if (open) {
      setMonth(defaultMonth);
      setYear(defaultYear);
      setReason("");
    }
  }, [open, defaultMonth, defaultYear]);

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const payload = {
    month,
    year,
    ...(reason.trim() ? { reason: reason.trim() } : {}),
  };

  const handleLock = () => {
    lockMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(
          `Locked ${getMonthName(month)} ${year} (${data.lockedRows} row(s))`
        );
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleUnlock = () => {
    unlockMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(
          `Unlocked ${getMonthName(month)} ${year} (${data.unlockedRows} row(s))`
        );
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Lock / unlock month</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Locking a month freezes every attendance record in it so payroll can
          run against immutable data.
        </DialogContentText>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            fullWidth
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            fullWidth
          >
            {yearOptions(defaultYear).map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: 2 }}
          helperText="Optional — recorded on the lock for audit."
        />

        <Alert severity="info" sx={{ mt: 1 }}>
          Unlock only if you need to correct records before re-running payroll.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={pending}>
          Cancel
        </Button>
        <Button
          onClick={handleUnlock}
          color="warning"
          variant="outlined"
          disabled={pending}
          startIcon={
            unlockMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <MdLockOpen size={16} />
            )
          }
        >
          Unlock
        </Button>
        <Button
          onClick={handleLock}
          variant="contained"
          disabled={pending}
          startIcon={
            lockMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <MdLock size={16} />
            )
          }
        >
          Lock
        </Button>
      </DialogActions>
    </Dialog>
  );
}
