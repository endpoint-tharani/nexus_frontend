import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
  TextField,
  Tooltip,
  Alert,
} from "@mui/material";
import { MdCheck, MdClose, MdDescription } from "react-icons/md";
import toast from "react-hot-toast";

import {
  useEmployeePreviousEmployments,
  useApprovePreviousEmployment,
  useRejectPreviousEmployment,
} from "../../hooks/tax/usePreviousEmployment";
import type { PreviousEmployment } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";
import StatusChip from "../ui/StatusChip";
import ConfirmDialog from "../ui/ConfirmDialog";

export interface AdminPreviousEmploymentSectionProps {
  employeeId: string;
  year: number;
}

export default function AdminPreviousEmploymentSection({
  employeeId,
  year,
}: AdminPreviousEmploymentSectionProps) {
  const { data: records = [], isLoading, isError, refetch } = useEmployeePreviousEmployments(
    employeeId,
    year
  );

  const approveMutation = useApprovePreviousEmployment();
  const rejectMutation = useRejectPreviousEmployment();

  const [approveTarget, setApproveTarget] = useState<PreviousEmployment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PreviousEmployment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const handleApprove = () => {
    if (!approveTarget) return;
    approveMutation.mutate(
      { id: approveTarget.id, employeeId },
      {
        onSuccess: () => {
          toast.success("Previous employment record approved");
          setApproveTarget(null);
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Please provide a rejection reason");
      return;
    }
    setRejectionError(null);
    rejectMutation.mutate(
      { id: rejectTarget.id, employeeId, reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success("Previous employment record rejected");
          setRejectTarget(null);
          setRejectionReason("");
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const renderAttachments = (record: PreviousEmployment) => {
    const attachments = [];
    if (record.form16Attachment) {
      attachments.push(
        <Tooltip key="form16" title={`Form 16: ${record.form16Attachment.split("/").pop()}`}>
          <Box component="span" sx={{ display: "inline-flex", color: "primary.main", mr: 1 }}>
            <MdDescription size={18} />
          </Box>
        </Tooltip>
      );
    }
    if (record.salarySlipAttachment) {
      attachments.push(
        <Tooltip key="salaryslip" title={`Salary Slip: ${record.salarySlipAttachment.split("/").pop()}`}>
          <Box component="span" sx={{ display: "inline-flex", color: "info.main" }}>
            <MdDescription size={18} />
          </Box>
        </Tooltip>
      );
    }
    return attachments.length > 0 ? attachments : <Typography variant="caption" color="text.secondary">—</Typography>;
  };

  if (isLoading) {
    return <Typography color="text.secondary">Loading previous employment details...</Typography>;
  }

  if (isError) {
    return <Alert severity="error">Failed to load previous employment details.</Alert>;
  }

  if (records.length === 0) {
    return null; // Don't show the section at all if there are no records
  }

  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <Typography color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
        Previous Employment Declarations
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employer</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Gross Salary</TableCell>
              <TableCell align="right">Taxable Salary</TableCell>
              <TableCell align="right">PT</TableCell>
              <TableCell align="right">TDS</TableCell>
              <TableCell align="center">Files</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => {
              const pending = record.status === "SUBMITTED";
              return (
                <TableRow key={record.id}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {record.employerName}
                    </Typography>
                    {(record.employerTan || record.employerPan) && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {record.employerTan ? `TAN: ${record.employerTan}` : ""}
                        {record.employerTan && record.employerPan ? " | " : ""}
                        {record.employerPan ? `PAN: ${record.employerPan}` : ""}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      {new Date(record.employmentFrom).toLocaleDateString()} -
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      {new Date(record.employmentTo).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(Number(record.grossSalary))}</TableCell>
                  <TableCell align="right">{formatCurrency(Number(record.taxableSalary))}</TableCell>
                  <TableCell align="right">{formatCurrency(Number(record.professionalTax))}</TableCell>
                  <TableCell align="right">{formatCurrency(Number(record.tdsDeducted))}</TableCell>
                  <TableCell align="center">{renderAttachments(record)}</TableCell>
                  <TableCell>
                    <StatusChip kind="declaration" status={record.status} />
                    {record.status === "REJECTED" && record.rejectionReason && (
                      <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 0.5 }}>
                        Reason: {record.rejectionReason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      {pending && (
                        <>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={<MdCheck />}
                            onClick={() => setApproveTarget(record)}
                            sx={{ minWidth: 80, height: 28, textTransform: "none", py: 0 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<MdClose />}
                            onClick={() => setRejectTarget(record)}
                            sx={{ minWidth: 80, height: 28, textTransform: "none", py: 0 }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approve Confirmation */}
      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Previous Employer Details"
        message={
          <>
            Approve details for <strong>{approveTarget?.employerName}</strong>?
            This will add <strong>{formatCurrency(Number(approveTarget?.grossSalary ?? 0))}</strong> to their taxable salary and update computations.
          </>
        }
        confirmLabel="Approve"
        severity="success"
        loading={approveMutation.isPending}
        onConfirm={handleApprove}
        onClose={() => setApproveTarget(null)}
      />

      {/* Reject Confirmation with Input */}
      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject Previous Employer Details"
        message={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Reject details for <strong>{rejectTarget?.employerName}</strong>?
              Please specify a reason below:
            </Typography>
            <TextField
              label="Rejection Reason"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectionError(null);
              }}
              error={!!rejectionError}
              helperText={rejectionError}
            />
          </Stack>
        }
        confirmLabel="Reject"
        severity="error"
        loading={rejectMutation.isPending}
        onConfirm={handleReject}
        onClose={() => {
          setRejectTarget(null);
          setRejectionReason("");
          setRejectionError(null);
        }}
      />
    </Box>
  );
}
