import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import toast from "react-hot-toast";

import SectionHeader from "./SectionHeader";
import ConfirmDialog from "../ui/ConfirmDialog";
import StatusChip from "../ui/StatusChip";
import PreviousEmploymentFormDialog from "./PreviousEmploymentFormDialog";
import {
  useMyPreviousEmployments,
  useSubmitPreviousEmployment,
} from "../../hooks/tax/usePreviousEmployment";
import type { PreviousEmployment } from "../../types";
import { formatCurrency, formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

export interface PreviousEmploymentAccordionProps {
  year: number;
}

/**
 * Previous Employment — collapsed by default with a numeric badge, expands to
 * a compact enterprise table + "Add Employer" button.
 * Enterprise style: 48px header, monochrome icons, no colored expanded bg.
 * All hook / mutation wiring is identical to the original component.
 */
export default function PreviousEmploymentAccordion({
  year,
}: PreviousEmploymentAccordionProps) {
  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useMyPreviousEmployments(year);

  const submitMutation = useSubmitPreviousEmployment();

  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PreviousEmployment | null>(null);
  const [submitTarget, setSubmitTarget] =
    useState<PreviousEmployment | null>(null);

  const handleSubmitRecord = () => {
    if (!submitTarget) return;
    submitMutation.mutate(submitTarget.id, {
      onSuccess: () => {
        toast.success("Previous employment record submitted for review");
        setSubmitTarget(null);
        refetch();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
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
    const icons: React.ReactNode[] = [];
    if (record.form16Attachment) {
      icons.push(
        <Tooltip key="form16" title={`Form 16: ${record.form16Attachment.split("/").pop()}`}>
          <Box component="span" sx={{ display: "inline-flex", color: "text.secondary", mr: 0.5 }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      );
    }
    if (record.salarySlipAttachment) {
      icons.push(
        <Tooltip key="slip" title={`Salary Slip: ${record.salarySlipAttachment.split("/").pop()}`}>
          <Box component="span" sx={{ display: "inline-flex", color: "text.secondary" }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      );
    }
    return icons.length > 0 ? (
      icons
    ) : (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  };

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded((p) => !p)}
        disableGutters
        elevation={0}
        sx={{
          border: "none",
          borderRadius: "10px !important",
          "&:before": { display: "none" },
          overflow: "hidden",
          transition: "box-shadow 150ms ease",
          "&.Mui-expanded": {
            boxShadow: "0 2px 6px rgba(15,23,42,0.07)",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />}
          aria-controls="prev-employment-content"
          id="prev-employment-header"
          sx={{
            px: 2.5,
            minHeight: 48,
            "&.Mui-expanded": { minHeight: 48 },
            "& .MuiAccordionSummary-content": { my: 0 },
            "&:hover": { bgcolor: "grey.50" },
            transition: "background-color 120ms ease",
          }}
        >
          <SectionHeader
            icon={<BusinessCenterOutlinedIcon />}
            title="Previous Employment"
            subtitle="Declare income from previous employers this financial year"
            badge={records.length || null}
          />
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2.5, pt: 1.5 }}>
          {/* Add button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleAddClick}
              aria-label="Add previous employer"
              disableElevation
              sx={{ borderRadius: "8px", fontWeight: 500 }}
            >
              Add Employer
            </Button>
          </Box>

          {isLoading ? (
            <Typography color="text.secondary" variant="body2" sx={{ py: 1 }}>
              Loading records…
            </Typography>
          ) : isError ? (
            <Alert severity="error" sx={{ mb: 1 }}>
              Failed to load previous employment records.
            </Alert>
          ) : records.length === 0 ? (
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ py: 2, textAlign: "center" }}
            >
              No previous employment records declared for this year.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "none",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "grey.50",
                      "& th": {
                        fontWeight: 600,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid #E5E7EB",
                        py: 1.25,
                      },
                    }}
                  >
                    <TableCell>Employer</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Gross</TableCell>
                    <TableCell align="right">Taxable</TableCell>
                    <TableCell align="right">TDS</TableCell>
                    <TableCell align="center">Files</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => {
                    const canEdit =
                      record.status === "DRAFT" || record.status === "REJECTED";
                    return (
                      <TableRow
                        key={record.id}
                        hover
                        sx={{
                          "& td": { borderColor: "#E5E7EB", py: 1 },
                          "&:last-child td": { border: 0 },
                          transition: "background-color 120ms ease",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {record.employerName}
                          </Typography>
                          {record.employerTan && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              TAN: {record.employerTan}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ display: "block", color: "text.primary" }}>
                            {formatDate(record.employmentFrom, "DD MMM YY")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            → {formatDate(record.employmentTo, "DD MMM YY")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.primary">
                            {formatCurrency(Number(record.grossSalary), {
                              fractionDigits: 0,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.primary">
                            {formatCurrency(Number(record.taxableSalary), {
                              fractionDigits: 0,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.primary">
                            {formatCurrency(Number(record.tdsDeducted), {
                              fractionDigits: 0,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {renderAttachments(record)}
                        </TableCell>
                        <TableCell>
                          <StatusChip kind="declaration" status={record.status} variant="outlined" />
                          {record.status === "REJECTED" &&
                            record.rejectionReason && (
                              <Typography
                                variant="caption"
                                color="error.main"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {record.rejectionReason}
                              </Typography>
                            )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            {canEdit && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    aria-label={`Edit ${record.employerName}`}
                                    onClick={() => handleEditClick(record)}
                                    sx={{ color: "text.secondary" }}
                                  >
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                {record.status === "DRAFT" && (
                                  <Tooltip title="Submit for review">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      aria-label={`Submit ${record.employerName}`}
                                      onClick={() => setSubmitTarget(record)}
                                    >
                                      <SendOutlinedIcon sx={{ fontSize: 16 }} />
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
        </AccordionDetails>
      </Accordion>

      {/* Form dialog — unchanged */}
      <PreviousEmploymentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          refetch();
        }}
        year={year}
        record={selectedRecord}
      />

      {/* Submit confirmation — unchanged */}
      <ConfirmDialog
        open={!!submitTarget}
        title="Submit Previous Employer Details"
        message={
          <>
            Submit details for <strong>{submitTarget?.employerName}</strong> for
            review? Once submitted, you cannot edit them until reviewed.
          </>
        }
        confirmLabel="Submit"
        severity="primary"
        loading={submitMutation.isPending}
        onConfirm={handleSubmitRecord}
        onClose={() => setSubmitTarget(null)}
      />
    </>
  );
}
