import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import toast from "react-hot-toast";

import { useRequestRegularization } from "../../hooks/attendance";
import { ATTENDANCE_STATUS_OPTIONS, AttendanceStatus } from "../../constants/enums";
import {
  regularizationRequestSchema,
  type RegularizationRequestFormData,
} from "../../schemas/attendance.schema";
import { getErrorMessage } from "../../utils/errorHandler";

export interface RequestRegularizationDialogProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
}

// Self-service correction request. The backend resolves the employee from the
// auth token, so no employeeId is sent.
export default function RequestRegularizationDialog({
  open,
  onClose,
  defaultDate = "",
}: RequestRegularizationDialogProps) {
  const requestMutation = useRequestRegularization();
  const { isPending } = requestMutation;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RegularizationRequestFormData>({
    resolver: zodResolver(regularizationRequestSchema),
    defaultValues: {
      date: defaultDate,
      requestedStatus: AttendanceStatus.PRESENT,
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        date: defaultDate,
        requestedStatus: AttendanceStatus.PRESENT,
        reason: "",
      });
    }
  }, [open, defaultDate, reset]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: RegularizationRequestFormData) => {
    requestMutation.mutate(
      {
        date: values.date,
        requestedStatus: values.requestedStatus,
        reason: values.reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Regularization request submitted");
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Request regularization</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Ask your approver to correct a day's attendance. They'll review it
          before it takes effect.
        </DialogContentText>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            type="date"
            label="Date"
            required
            {...register("date")}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.date}
            helperText={errors.date?.message ?? " "}
          />

          <Controller
            name="requestedStatus"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Requested status"
                required
                {...field}
                error={!!errors.requestedStatus}
                helperText={errors.requestedStatus?.message ?? " "}
              >
                {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Reason"
            required
            multiline
            minRows={2}
            {...register("reason")}
            error={!!errors.reason}
            helperText={errors.reason?.message ?? " "}
          />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={handleClose} color="inherit" disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              Submit request
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
