import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import toast from "react-hot-toast";

import { useRejectDeclaration } from "../../hooks/tax";
import { rejectionSchema } from "../../schemas/tax.schema";
import type { RejectionFormData } from "../../schemas/tax.schema";
import type { TaxDeclaration } from "../../types";
import { formatFinancialYear } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

export interface RejectionDialogProps {
  open: boolean;
  declaration: TaxDeclaration | null;
  onClose: () => void;
}

const EMPTY_VALUES: RejectionFormData = { reason: "" };

// Self-contained rejection dialog. Owns the reject mutation plus an RHF + Zod
// form whose only field — a mandatory reason — is validated by `rejectionSchema`
// (no `z.coerce`, so the default zodResolver typing is used as-is).
export default function RejectionDialog({
  open,
  declaration,
  onClose,
}: RejectionDialogProps) {
  const rejectMutation = useRejectDeclaration();
  const { isPending } = rejectMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Clear the reason each time the dialog re-opens for a (possibly different)
  // declaration so a stale message never carries over.
  useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, declaration, reset]);

  const who =
    declaration?.employeeName ?? declaration?.employeeCode ?? "this employee";

  const onSubmit = (values: RejectionFormData) => {
    if (!declaration) return;
    rejectMutation.mutate(
      { declarationId: declaration.id, reason: values.reason.trim() },
      {
        onSuccess: () => {
          toast.success("Declaration rejected");
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Reject declaration</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Reject the{" "}
            <strong>
              {declaration ? formatFinancialYear(declaration.year) : "selected"}
            </strong>{" "}
            tax declaration for <strong>{who}</strong>. Provide a reason — it is
            shown to the employee so they can correct and resubmit.
          </DialogContentText>
          <TextField
            label="Reason for rejection"
            fullWidth
            multiline
            minRows={3}
            autoFocus
            disabled={isPending}
            {...register("reason")}
            error={!!errors.reason}
            helperText={errors.reason?.message ?? " "}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={isPending}
            sx={{ minWidth: 120 }}
          >
            {isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
