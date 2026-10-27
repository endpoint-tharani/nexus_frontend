import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import toast from "react-hot-toast";

import { StatusChip } from "../ui";
import { useReviewRegularization } from "../../hooks/attendance";
import { RegularizationAction } from "../../constants/enums";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RegularizationRow } from "../../types";

export interface RegularizationReviewDialogProps {
  request: RegularizationRow | null;
  onClose: () => void;
}

// Approve/reject one pending regularization. Approving also upserts the
// underlying attendance row server-side (handled by the backend).
export default function RegularizationReviewDialog({
  request,
  onClose,
}: RegularizationReviewDialogProps) {
  const reviewMutation = useReviewRegularization();
  const { isPending } = reviewMutation;
  const [note, setNote] = useState("");

  useEffect(() => {
    if (request) setNote("");
  }, [request]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const submit = (action: RegularizationAction) => {
    if (!request) return;
    reviewMutation.mutate(
      {
        id: request.id,
        data: { action, ...(note.trim() ? { note: note.trim() } : {}) },
      },
      {
        onSuccess: () => {
          toast.success(
            action === RegularizationAction.APPROVED
              ? "Regularization approved"
              : "Regularization rejected"
          );
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Dialog open={!!request} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Review regularization</DialogTitle>
      <DialogContent>
        {request && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Row label="Employee">
              {request.employee?.name ?? request.employeeId}
              {request.employee?.employeeCode
                ? ` (${request.employee.employeeCode})`
                : ""}
            </Row>
            <Row label="Date">{formatDate(request.date)}</Row>
            <Row label="Requested status">
              <StatusChip kind="attendance" status={request.requestedStatus} />
            </Row>
            <Row label="Current status">
              <StatusChip kind="regularization" status={request.status} />
            </Row>
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Reason
              </Typography>
              <Typography variant="body2">{request.reason}</Typography>
            </Box>

            <TextField
              label="Review note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 1 }}
              helperText="Optional — shared with the employee."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={() => submit(RegularizationAction.REJECTED)}
          color="error"
          variant="outlined"
          disabled={isPending}
          startIcon={
            reviewMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <MdCancel size={16} />
            )
          }
        >
          Reject
        </Button>
        <Button
          onClick={() => submit(RegularizationAction.APPROVED)}
          variant="contained"
          color="success"
          disabled={isPending}
          startIcon={
            reviewMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <MdCheckCircle size={16} />
            )
          }
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 130, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.875rem" }}>{children}</Box>
    </Box>
  );
}
