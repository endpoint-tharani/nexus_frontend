import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
} from "@mui/material";
import { MdAdd, MdEdit, MdSend, MdDescription } from "react-icons/md";
import toast from "react-hot-toast";

import SectionCard from "../ui/SectionCard";
import ConfirmDialog from "../ui/ConfirmDialog";
import PreviousEmploymentFormDialog from "./PreviousEmploymentFormDialog";
import {
  useMyPreviousEmployments,
  useSubmitPreviousEmployment,
} from "../../hooks/tax/usePreviousEmployment";
import type { PreviousEmployment } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";
import StatusChip from "../ui/StatusChip";

export interface PreviousEmploymentSectionProps {
  year: number;
}

export default function PreviousEmploymentSection({ year }: PreviousEmploymentSectionProps) {
  const { data: records = [], isLoading, isError, refetch } = useMyPreviousEmployments(year);
  const submitMutation = useSubmitPreviousEmployment();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PreviousEmployment | null>(null);
  const [submitTarget, setSubmitTarget] = useState<PreviousEmployment | null>(null);

  const handleSubmitRecord = () => {
    if (!submitTarget) return;
    submitMutation.mutate(submitTarget.id, {
      onSuccess: () => {
        toast.success("Previous employment record submitted for review");
        setSubmitTarget(null);
        refetch();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  };

  const handleEditClick = (record: PreviousEmployment) => {
    setSelectedRecord(record);
    setFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRecord(null);
    setFormOpen(true);
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

  return (
    <SectionCard
      title="Previous Employment Details"
      subtitle="Declare income from previous employers during this financial year."
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<MdAdd />}
          onClick={handleAddClick}
        >
          Add Employer
        </Button>
      }
    >
      {isLoading ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>Loading records...</Typography>
      ) : isError ? (
        <Alert severity="error">Failed to load previous employment records.</Alert>
      ) : records.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No previous employment records declared for this year.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ border: 0 }}>
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
                const canEdit = record.status === "DRAFT" || record.status === "REJECTED";
                return (
                  <TableRow key={record.id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {record.employerName}
                      </Typography>
                      {record.employerTan && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          TAN: {record.employerTan}
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
                        {canEdit && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditClick(record)}>
                                <MdEdit size={16} />
                              </IconButton>
                            </Tooltip>
                            {record.status === "DRAFT" && (
                              <Tooltip title="Submit for Review">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => setSubmitTarget(record)}
                                >
                                  <MdSend size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
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
      )}

      {/* Form Dialog */}
      <PreviousEmploymentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refetch();
        }}
        year={year}
        record={selectedRecord}
      />

      {/* Submit Confirmation */}
      <ConfirmDialog
        open={!!submitTarget}
        title="Submit Previous Employer Details"
        message={
          <>
            Submit details for <strong>{submitTarget?.employerName}</strong> for review?
            Once submitted, you cannot edit them until reviewed.
          </>
        }
        confirmLabel="Submit"
        severity="primary"
        loading={submitMutation.isPending}
        onConfirm={handleSubmitRecord}
        onClose={() => setSubmitTarget(null)}
      />
    </SectionCard>
  );
}
