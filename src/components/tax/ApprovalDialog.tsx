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

import { useApproveDeclaration } from "../../hooks/tax";
import type { TaxDeclaration } from "../../types";
import { formatFinancialYear } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

export interface ApprovalDialogProps {
  open: boolean;
  declaration: TaxDeclaration | null;
  onClose: () => void;
}

// Self-contained approval confirmation. Owns the approve mutation and its
// toasts; the page just supplies the target declaration and toggles `open`.
export default function ApprovalDialog({
  open,
  declaration,
  onClose,
}: ApprovalDialogProps) {
  const approveMutation = useApproveDeclaration();
  const { isPending } = approveMutation;

  const who =
    declaration?.employeeName ?? declaration?.employeeCode ?? "this employee";

  const handleApprove = () => {
    if (!declaration) return;
    approveMutation.mutate(declaration.id, {
      onSuccess: () => {
        toast.success("Declaration approved");
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
      <DialogTitle sx={{ fontWeight: 700 }}>Approve declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Approve the{" "}
          <strong>
            {declaration ? formatFinancialYear(declaration.year) : "selected"}
          </strong>{" "}
          tax declaration for <strong>{who}</strong>? Once approved, the employee
          can no longer edit it.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          color="success"
          variant="contained"
          onClick={handleApprove}
          disabled={isPending}
          sx={{ minWidth: 120 }}
        >
          {isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Approve"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
