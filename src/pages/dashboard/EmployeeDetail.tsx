import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  MdArrowBack,
  MdEdit,
  MdPerson,
  MdPayments,
  MdReceiptLong,
  MdHistory,
  MdFolder,
  MdRefresh,
  MdDelete,
  MdAdd,
  MdVisibility,
  MdUploadFile,
  MdFileDownload,
  MdPlaylistAdd,
} from "react-icons/md";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { API_BASE_URL } from "../../api/axios";

// Design System & Components
import { AppPage, SectionCard, StatusChip, ErrorState, LoadingSkeleton, StatCard, ConfirmDialog, EmptyState } from "../../components/ui";
import { GENDER_LABELS, EmployeeStatus } from "../../constants/enums";
import type { Gender } from "../../constants/enums";
import { formatCurrency, formatDate, formatFinancialYear, financialYearOptions, getFinancialYear, initial, toNumber } from "../../utils/format";
import { formatShiftTime } from "../../utils/shift";
import { getErrorMessage } from "../../utils/errorHandler";
// Hooks
import { useEmployee, useUpdateEmployee, useUpdateEmployeeStatus, useEnableLogin, useDisableLogin } from "../../hooks/employee";
import { useBranches } from "../../hooks/branch";
import { useDepartments } from "../../hooks/department";
import { usePayStatement } from "../../hooks/payroll/usePayStatement";
import { useShiftHistory } from "../../hooks/shift/useShiftHistory";
import {
  useEmployeePreviousEmployments,
  useApprovePreviousEmployment,
  useRejectPreviousEmployment,
  useDeletePreviousEmploymentAdmin,
  useUploadPreviousEmploymentFile,
} from "../../hooks/tax/usePreviousEmployment";
import { useGratuityList, useCreateOrUpdateGratuity, useDeleteGratuity } from "../../hooks/payroll/useGratuity";
import { useELEncashmentList, useCreateELEncashment, useUpdateELEncashment, useDeleteELEncashment } from "../../hooks/payroll/useELEncashment";
import { useTaxDeclarations, useTaxDeclaration } from "../../hooks/tax";

// Modals / Dialogs
import EmployeeForm from "../../components/employee/EmployeeForm";
import PreviousEmploymentFormDialog from "../../components/meTax/PreviousEmploymentFormDialog";
import { ProofManagement, ApprovalDialog, RejectionDialog } from "../../components/tax";
import SalaryRegisterTable from "../../components/payroll/SalaryRegisterTable";
import type { Employee, PreviousEmployment, GratuityRecord, ELEncashmentRecord } from "../../types";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

// Helpers
const genderLabel = (gender?: string | null) =>
  gender ? (GENDER_LABELS[gender as Gender] ?? gender) : "—";

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 500, color: value ? "text.primary" : "text.disabled" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ─── TABS DEFINITION ──────────────────────────────────────────────────────────
const TABS = [
  { label: "Overview", icon: MdPerson },
  { label: "Salary", icon: MdPayments },
  { label: "Prev. Employment", icon: MdHistory },
  { label: "Gratuity", icon: MdHistory },
  { label: "EL Encashment", icon: MdHistory },
  { label: "Tax", icon: MdReceiptLong },
  { label: "Documents", icon: MdFolder },
];

// ─── OVERVIEW TAB PANEL ───────────────────────────────────────────────────────
function OverviewTabPanel({
  employeeId,
  emp,
}: {
  employeeId: string;
  emp: Employee;
}) {
  const { data: branches = [] } = useBranches();
  const { data: shiftHistory, isLoading: loadingShift } = useShiftHistory(employeeId);

  const employeeBranchName = useMemo(() => {
    if (!emp.branchId) return "—";
    return branches.find((b) => b.id === emp.branchId)?.name || emp.branchId;
  }, [emp.branchId, branches]);

  const activeShiftLabel = useMemo(() => {
    if (!shiftHistory?.active?.shift) return "No active shift";
    const s = shiftHistory.active.shift as any;
    return `${s.name} (${formatShiftTime(s.startTimeMin, s.endTimeMin)})`;
  }, [shiftHistory]);


  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={2}>
          {/* Personal Info */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionCard title="Personal Information">
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <InfoField label="Full Name" value={emp.name} />
                <InfoField label="Gender" value={genderLabel(emp.gender)} />
                <InfoField label="Email" value={emp.email} />
                <InfoField label="Phone" value={emp.phoneNumber} />
                <InfoField label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <InfoField label="Address" value={emp.address} />
                </Box>
              </Box>
            </SectionCard>
          </Grid>

          {/* Employment summary */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionCard title="Employment Summary">
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <InfoField label="Designation" value={emp.designation} />
                <InfoField label="Department" value={emp.department?.name} />
                <InfoField label="Branch" value={employeeBranchName} />
                <InfoField label="Join Date" value={formatDate(emp.joinDate)} />
                <InfoField label="Reporting Manager" value="—" />
                <InfoField label="Active Shift" value={loadingShift ? "Loading..." : activeShiftLabel} />
              </Box>
            </SectionCard>
          </Grid>

          {/* Statutory & KYC */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Statutory & KYC Details">
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
                <InfoField label="PAN" value={emp.panNumber} />
                <InfoField label="Aadhaar" value={emp.aadhaarNo} />
                <InfoField label="UAN" value={emp.uanNumber} />
                <InfoField label="PF Number" value={emp.pfNumber} />
                <InfoField label="ESI Number" value={emp.esiNumber} />
              </Box>
            </SectionCard>
          </Grid>

          {/* Bank details */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Bank Details">
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                <InfoField label="Bank Name" value={emp.bankName} />
                <InfoField label="Account Number" value={emp.bankAccountNumber} />
                <InfoField label="IFSC Code" value={emp.ifscCode} />
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

// ─── PAYROLL TAB PANEL ────────────────────────────────────────────────────────
function PayrollTabPanel({ employeeId }: { employeeId: string }) {
  const [year, setYear] = useState<number>(CURRENT_FY);
  const { data: statement, isLoading, isError, refetch } = usePayStatement(employeeId, year);

  const months = statement?.months ?? [];
  const grandTotals = statement?.totals.grandTotal;

  if (isLoading) return <LoadingSkeleton variant="card" count={3} />;
  if (isError) return <ErrorState description="Failed to load payroll details." onRetry={() => refetch()} />;
  if (!statement || months.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 200 }}
        >
          {FY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <EmptyState title="No payroll history" description="There are no payroll records for this employee in the selected year." />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Filters row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 200, "& .MuiInputBase-root": { height: 40, borderRadius: "10px" } }}
        >
          {FY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <IconButton onClick={() => refetch()} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", width: 40, height: 40 }}>
          <MdRefresh size={18} />
        </IconButton>
      </Box>

      {/* Salary Rollups */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}>
        <StatCard label="Estimated CTC / Annual Gross" value={toNumber(grandTotals?.gross) ?? 0} color="primary" />
        <StatCard label="Total Deductions (Annual)" value={toNumber(grandTotals?.totalDeductions) ?? 0} color="warning" />
        <StatCard label="Estimated Annual Net" value={toNumber(grandTotals?.netPay) ?? 0} color="success" />
      </Box>

      {/* Salary register — month × component matrix */}
      <SectionCard
        title="Salary Register"
        subtitle="Month-by-month breakdown of every earning and deduction. All amounts are in ₹; “–” means nil. Projected months are estimated from the latest salary, and scroll sideways to see every component."
        disableContentPadding
      >
        <SalaryRegisterTable
          months={months}
          componentTotals={statement.componentTotals}
          totals={statement.totals}
        />
      </SectionCard>
    </Box>
  );
}

// ─── PREVIOUS EMPLOYMENT TAB PANEL ────────────────────────────────────────────
function PreviousEmploymentTabPanel({ employeeId }: { employeeId: string }) {
  const [year, setYear] = useState<number>(CURRENT_FY);

  const { data: records = [], isLoading, isError, refetch } = useEmployeePreviousEmployments(employeeId, year);

  const approveMutation = useApprovePreviousEmployment();
  const rejectMutation = useRejectPreviousEmployment();
  const deleteMutation = useDeletePreviousEmploymentAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PreviousEmployment | null>(null);
  const [approveTarget, setApproveTarget] = useState<PreviousEmployment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PreviousEmployment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PreviousEmployment | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    if (!approveTarget) return;
    approveMutation.mutate(
      { id: approveTarget.id, employeeId },
      {
        onSuccess: () => {
          toast.success("Record approved");
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
      toast.error("Please provide a reason");
      return;
    }
    rejectMutation.mutate(
      { id: rejectTarget.id, employeeId, reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success("Record rejected");
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

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id, employeeId },
      {
        onSuccess: () => {
          toast.success("Record deleted");
          setDeleteTarget(null);
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState description="Failed to load previous employment details." onRetry={() => refetch()} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 200, "& .MuiInputBase-root": { height: 40, borderRadius: "10px" } }}
        >
          {FY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <IconButton onClick={() => refetch()} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", width: 40, height: 40 }}>
          <MdRefresh size={18} />
        </IconButton>
        <Button variant="contained" startIcon={<MdAdd />} onClick={() => { setSelectedRecord(null); setFormOpen(true); }} sx={{ height: 40, borderRadius: "10px" }}>
          Add Record
        </Button>
      </Box>

      {records.length === 0 ? (
        <EmptyState title="No Previous Employment" description="No previous employment records declared for this year." />
      ) : (
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
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => {
                const pending = r.status === "SUBMITTED";
                const editable = r.status === "DRAFT" || r.status === "REJECTED";
                return (
                  <TableRow key={r.id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.employerName}</Typography>
                      {r.employerTan && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          TAN: {r.employerTan}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(r.employmentFrom)} — {formatDate(r.employmentTo)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(Number(r.grossSalary))}</TableCell>
                    <TableCell align="right">{formatCurrency(Number(r.taxableSalary))}</TableCell>
                    <TableCell align="right">{formatCurrency(Number(r.professionalTax))}</TableCell>
                    <TableCell align="right">{formatCurrency(Number(r.tdsDeducted))}</TableCell>
                    <TableCell>
                      <StatusChip kind="declaration" status={r.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        {pending && (
                          <>
                            <Button size="small" color="success" variant="outlined" onClick={() => setApproveTarget(r)}>
                              Approve
                            </Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => setRejectTarget(r)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {editable && (
                          <IconButton size="small" onClick={() => { setSelectedRecord(r); setFormOpen(true); }}>
                            <MdEdit size={16} />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
                          <MdDelete size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Previous Employment Form Dialog */}
      <PreviousEmploymentFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); refetch(); }}
        year={year}
        record={selectedRecord}
        employeeId={employeeId}
      />

      {/* Confirm Approve */}
      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Record"
        message={`Approve details for ${approveTarget?.employerName}? This adds ${formatCurrency(Number(approveTarget?.grossSalary ?? 0))} to taxable income.`}
        confirmLabel="Approve"
        severity="success"
        loading={approveMutation.isPending}
        onConfirm={handleApprove}
        onClose={() => setApproveTarget(null)}
      />

      {/* Confirm Reject */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Specify rejection reason for {rejectTarget?.employerName}:</Typography>
          <TextField
            fullWidth
            size="small"
            label="Rejection Reason"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={rejectMutation.isPending}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Record"
        message={`Are you sure you want to delete the previous employment record for ${deleteTarget?.employerName}?`}
        confirmLabel="Delete"
        severity="error"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

// ─── GRATUITY TAB PANEL ───────────────────────────────────────────────────────
function GratuityTabPanel({ employeeId, employeeJoinDate }: { employeeId: string; employeeJoinDate?: string | null }) {
  const { data: records = [], isLoading, isError, refetch } = useGratuityList({ employeeId });

  const mutation = useCreateOrUpdateGratuity();
  const deleteMutation = useDeleteGratuity();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GratuityRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form states
  const [joiningDate, setJoiningDate] = useState("");
  const [leavingDate, setLeavingDate] = useState("");
  const [lastDrawnSalary, setLastDrawnSalary] = useState(0);
  const [completedService, setCompletedService] = useState(0);
  const [gratuityAmount, setGratuityAmount] = useState(0);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (joiningDate && leavingDate) {
      const diff = dayjs(leavingDate).diff(dayjs(joiningDate), "year", true);
      setCompletedService(Math.max(0, parseFloat(diff.toFixed(1))));
    }
  }, [joiningDate, leavingDate]);

  useEffect(() => {
    if (completedService && lastDrawnSalary) {
      const calculated = Math.round(completedService * lastDrawnSalary * 15 / 26);
      setGratuityAmount(calculated);
    }
  }, [completedService, lastDrawnSalary]);

  const handleOpenDialog = (record?: GratuityRecord) => {
    if (record) {
      setSelectedRecord(record);
      setJoiningDate(record.joiningDate.slice(0, 10));
      setLeavingDate(record.leavingDate.slice(0, 10));
      setLastDrawnSalary(Number(record.lastDrawnSalary));
      setCompletedService(Number(record.completedService));
      setGratuityAmount(Number(record.gratuityAmount));
      setRemarks(record.remarks || "");
    } else {
      setSelectedRecord(null);
      setJoiningDate(employeeJoinDate ? employeeJoinDate.slice(0, 10) : "");
      setLeavingDate("");
      setLastDrawnSalary(0);
      setCompletedService(0);
      setGratuityAmount(0);
      setRemarks("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!joiningDate || !leavingDate) {
      toast.error("Joining and leaving dates are required");
      return;
    }
    mutation.mutate(
      {
        id: selectedRecord?.id,
        employeeId,
        joiningDate: new Date(joiningDate).toISOString(),
        leavingDate: new Date(leavingDate).toISOString(),
        lastDrawnSalary,
        completedService,
        gratuityAmount,
        remarks: remarks || null,
      },
      {
        onSuccess: () => {
          toast.success(selectedRecord ? "Gratuity updated" : "Gratuity saved");
          setDialogOpen(false);
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Gratuity record deleted");
        setDeleteTarget(null);
        refetch();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState description="Failed to load gratuity records." onRetry={() => refetch()} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Gratuity Calculations</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => refetch()} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", width: 40, height: 40 }}>
            <MdRefresh size={18} />
          </IconButton>
          <Button variant="contained" startIcon={<MdAdd />} onClick={() => handleOpenDialog()} sx={{ height: 40, borderRadius: "10px" }}>
            Calculate Gratuity
          </Button>
        </Box>
      </Box>

      {records.length === 0 ? (
        <EmptyState title="No Gratuity Records" description="No gratuity calculations exist for this employee." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Joining Date</TableCell>
                <TableCell>Leaving Date</TableCell>
                <TableCell align="right">Completed Service</TableCell>
                <TableCell align="right">Last Drawn Salary</TableCell>
                <TableCell align="right">Calculated Gratuity</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.joiningDate)}</TableCell>
                  <TableCell>{formatDate(r.leavingDate)}</TableCell>
                  <TableCell align="right">{r.completedService} Years</TableCell>
                  <TableCell align="right">{formatCurrency(Number(r.lastDrawnSalary))}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: "primary.main" }}>
                    {formatCurrency(Number(r.gratuityAmount))}
                  </TableCell>
                  <TableCell>{r.remarks || "—"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(r)}>
                        <MdEdit size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(r.id)}>
                        <MdDelete size={16} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Gratuity Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedRecord ? "Edit Gratuity Calculation" : "New Gratuity Calculation"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Leaving Date"
                type="date"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={leavingDate}
                onChange={(e) => setLeavingDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Completed Service (Years)"
                type="number"
                size="small"
                slotProps={{ htmlInput: { step: "0.1", min: 0 } }}
                value={completedService}
                onChange={(e) => setCompletedService(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Drawn Salary"
                type="number"
                size="small"
                value={lastDrawnSalary}
                onChange={(e) => setLastDrawnSalary(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Calculated Gratuity Amount"
                type="number"
                size="small"
                value={gratuityAmount}
                onChange={(e) => setGratuityAmount(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                size="small"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={mutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Gratuity Record"
        message="Are you sure you want to delete this gratuity record?"
        confirmLabel="Delete"
        severity="error"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

// ─── EL ENCASHMENT TAB PANEL ──────────────────────────────────────────────────
function ELEncashmentTabPanel({ employeeId, employeeJoinDate }: { employeeId: string; employeeJoinDate?: string | null }) {
  const { data: records = [], isLoading, isError, refetch } = useELEncashmentList({ employeeId });

  const createMutation = useCreateELEncashment();
  const updateMutation = useUpdateELEncashment();
  const deleteMutation = useDeleteELEncashment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ELEncashmentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form states
  const [financialYear, setFinancialYear] = useState<number>(CURRENT_FY);
  const [retirementDate, setRetirementDate] = useState("");
  const [leaveDaysEncashed, setLeaveDaysEncashed] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [yearsOfService, setYearsOfService] = useState(0);
  const [isGovernmentEmployee, setIsGovernmentEmployee] = useState(false);
  const [encashmentAmount, setEncashmentAmount] = useState(0);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (employeeJoinDate && retirementDate) {
      const diff = dayjs(retirementDate).diff(dayjs(employeeJoinDate), "year", true);
      setYearsOfService(Math.max(0, parseFloat(diff.toFixed(1))));
    }
  }, [employeeJoinDate, retirementDate]);

  useEffect(() => {
    if (leaveDaysEncashed && averageSalary) {
      const calculated = Math.round((averageSalary * leaveDaysEncashed) / 30);
      setEncashmentAmount(calculated);
    }
  }, [leaveDaysEncashed, averageSalary]);

  const handleOpenDialog = (record?: ELEncashmentRecord) => {
    if (record) {
      setSelectedRecord(record);
      setFinancialYear(record.financialYear);
      // derive retirement date or leave empty
      setRetirementDate("");
      setLeaveDaysEncashed(Number(record.leaveDaysEncashed));
      setAverageSalary(record.averageMonthlySalary ? Number(record.averageMonthlySalary) : 0);
      setYearsOfService(Number(record.yearsOfService));
      setIsGovernmentEmployee(!!record.isGovernmentEmployee);
      setEncashmentAmount(Number(record.encashmentAmount));
      setRemarks(record.remarks || "");
    } else {
      setSelectedRecord(null);
      setFinancialYear(CURRENT_FY);
      setRetirementDate("");
      setLeaveDaysEncashed(0);
      setAverageSalary(0);
      setYearsOfService(0);
      setIsGovernmentEmployee(false);
      setEncashmentAmount(0);
      setRemarks("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = {
      employeeId,
      financialYear,
      leaveDaysEncashed,
      averageMonthlySalary: averageSalary,
      yearsOfService,
      isGovernmentEmployee,
      encashmentAmount,
      remarks: remarks || null,
    };

    const action = selectedRecord
      ? updateMutation.mutateAsync({ id: selectedRecord.id, ...payload })
      : createMutation.mutateAsync(payload);

    action
      .then(() => {
        toast.success(selectedRecord ? "EL Encashment updated" : "EL Encashment saved");
        setDialogOpen(false);
        refetch();
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
      });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("EL Encashment record deleted");
        setDeleteTarget(null);
        refetch();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState description="Failed to load EL Encashment records." onRetry={() => refetch()} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>EL Encashment Log</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => refetch()} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", width: 40, height: 40 }}>
            <MdRefresh size={18} />
          </IconButton>
          <Button variant="contained" startIcon={<MdAdd />} onClick={() => handleOpenDialog()} sx={{ height: 40, borderRadius: "10px" }}>
            Add Encashment
          </Button>
        </Box>
      </Box>

      {records.length === 0 ? (
        <EmptyState title="No EL Encashment Records" description="No earned leave encashment calculations exist for this employee." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Financial Year</TableCell>
                <TableCell align="right">Leave Days</TableCell>
                <TableCell align="right">Average Salary</TableCell>
                <TableCell align="right">Years of Service</TableCell>
                <TableCell>Govt. Employee</TableCell>
                <TableCell align="right">Encashment Amount</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{formatFinancialYear(r.financialYear)}</TableCell>
                  <TableCell align="right">{r.leaveDaysEncashed}</TableCell>
                  <TableCell align="right">{formatCurrency(Number(r.averageMonthlySalary))}</TableCell>
                  <TableCell align="right">{r.yearsOfService} Years</TableCell>
                  <TableCell>{r.isGovernmentEmployee ? "Yes" : "No"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: "success.main" }}>
                    {formatCurrency(Number(r.encashmentAmount))}
                  </TableCell>
                  <TableCell>{r.remarks || "—"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(r)}>
                        <MdEdit size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(r.id)}>
                        <MdDelete size={16} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* EL Encashment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedRecord ? "Edit EL Encashment" : "New EL Encashment"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Financial Year"
                size="small"
                value={financialYear}
                onChange={(e) => setFinancialYear(Number(e.target.value))}
              >
                {FY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of Retirement / Resignation"
                type="date"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={retirementDate}
                onChange={(e) => setRetirementDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Leave Days Encashed"
                type="number"
                size="small"
                value={leaveDaysEncashed}
                onChange={(e) => setLeaveDaysEncashed(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Average Monthly Salary"
                type="number"
                size="small"
                value={averageSalary}
                onChange={(e) => setAverageSalary(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Years of Service"
                type="number"
                size="small"
                value={yearsOfService}
                onChange={(e) => setYearsOfService(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isGovernmentEmployee}
                    onChange={(e) => setIsGovernmentEmployee(e.target.checked)}
                  />
                }
                label="Government Employee"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Encashment Amount"
                type="number"
                size="small"
                value={encashmentAmount}
                onChange={(e) => setEncashmentAmount(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                size="small"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete EL Encashment Record"
        message="Are you sure you want to delete this encashment record?"
        confirmLabel="Delete"
        severity="error"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

const normalizeSectionCode = (code: string): string => {
  const normalized = code.toUpperCase();
  if (normalized.includes("80C_") || normalized === "SECTION_80C" || normalized === "80C") return "SECTION_80C";
  if (normalized.includes("80CCD_1B") || normalized.includes("80CCD(1B)")) return "SECTION_80CCD_1B";
  if (normalized.includes("80CCD") || normalized === "SECTION_80CCD" || normalized === "80CCD") return "SECTION_80CCD";
  if (normalized.includes("80D_") || normalized === "SECTION_80D" || normalized === "80D") return "SECTION_80D";
  if (normalized.includes("80DD_") || normalized === "SECTION_80DD" || normalized === "80DD") return "SECTION_80DD";
  if (normalized.includes("80DDB_") || normalized === "SECTION_80DDB" || normalized === "80DDB") return "SECTION_80DDB";
  if (normalized.includes("80E_") || normalized === "SECTION_80E" || normalized === "80E") return "SECTION_80E";
  if (normalized.includes("80G_") || normalized === "SECTION_80G" || normalized === "80G") return "SECTION_80G";
  if (normalized.includes("HRA")) return "HRA";
  if (normalized.includes("HOME_LOAN") || normalized.includes("24B")) return "HOME_LOAN";
  if (normalized.includes("NPS")) return "NPS";
  return "OTHER";
};

// ─── TAX TAB PANEL ────────────────────────────────────────────────────────────
function TaxTabPanel({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();
  const [year, setYear] = useState<number>(CURRENT_FY);

  const { data: declarations = [], isLoading, isError, refetch } = useTaxDeclarations(year, { employeeId });

  const declaration = declarations[0];
  const declarationId = declaration?.id;

  const { data: detail, isLoading: loadingDetail, refetch: refetchDetail } = useTaxDeclaration(declarationId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  // Collect all documents from structured entries
  const structuredDocs = useMemo(() => {
    if (!detail?.entries) return [];
    const docs: {
      docId: string;
      sectionCode: string;
      entryName: string;
      fileName: string;
      fileSize?: number;
      s3Key: string;
      url?: string;
      createdAt: string;
      mimeType: string;
      amount?: number;
    }[] = [];

    const getEntryName = (entry: any) => {
      const valKeys = Object.keys(entry.values || {});
      const descriptives = ["particulars", "description", "name", "policyNumber", "lenderName", "institutionName", "insurerName"];
      for (const key of descriptives) {
        if (entry.values[key]) return entry.values[key];
      }
      for (const key of valKeys) {
        if (entry.values[key] && typeof entry.values[key] === "string" && entry.values[key].length > 1) {
          return entry.values[key];
        }
      }
      return `Entry #${entry.entryIndex}`;
    };

    for (const entry of detail.entries) {
      if (!entry.documents || entry.documents.length === 0) continue;
      const entryName = getEntryName(entry);
      for (const doc of entry.documents) {
        docs.push({
          docId: doc.id,
          sectionCode: entry.sectionCode,
          entryName,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          s3Key: doc.s3Key,
          url: doc.url,
          createdAt: doc.createdAt,
          mimeType: doc.mimeType,
          amount: entry.computedAmount,
        });
      }
    }
    return docs;
  }, [detail]);

  const handleRefresh = () => {
    refetch();
    if (declarationId) refetchDetail();
  };


  if (isLoading || loadingDetail) return <LoadingSkeleton variant="card" count={3} />;
  if (isError) return <ErrorState description="Failed to load tax declaration." onRetry={handleRefresh} />;

  if (!declaration) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 200 }}
        >
          {FY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <EmptyState title="No Tax Declaration" description="No tax declaration submitted for this financial year." />
      </Box>
    );
  }

  const getS3FileUrl = (s3Key: string): string => {
    return `${API_BASE_URL}/me/tax/document/view?key=${encodeURIComponent(s3Key)}`;
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header filter */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 200, "& .MuiInputBase-root": { height: 40, borderRadius: "10px" } }}
        >
          {FY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <IconButton onClick={handleRefresh} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", width: 40, height: 40 }}>
          <MdRefresh size={18} />
        </IconButton>
        {declaration.status === "SUBMITTED" && (
          <>
            <Button variant="contained" color="success" onClick={() => setApproveOpen(true)} sx={{ height: 40, borderRadius: "10px" }}>Approve</Button>
            <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)} sx={{ height: 40, borderRadius: "10px" }}>Reject</Button>
          </>
        )}
        <Button variant="outlined" startIcon={<MdVisibility />} onClick={() => declarationId && navigate(`/dashboard/tax/declarations/${declarationId}`)} sx={{ height: 40, borderRadius: "10px" }}>
          View Working Sheet
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2.5 }}>
        <StatCard label="Regime" value={declaration.regime} color="primary" />
        <StatCard label="Estimated Tax" value={toNumber(declaration.estimatedTax) ?? 0} color="warning" />
        <StatCard label="TDS Deducted" value={toNumber(declaration.tdsDeducted) ?? 0} color="info" />
        <StatCard label="Status" value={declaration.status} color="success" />
      </Box>

      {/* Detailed proofs verify panel */}
      {detail && (
        <SectionCard title="Verification Proofs List" subtitle="Declarations and attachment documents.">
          <ProofManagement
            declarationId={declarationId ?? ""}
            items={detail.items ?? []}
            prefillData={prefillData}
            onClearPrefill={() => setPrefillData(null)}
          />
        </SectionCard>
      )}

      {/* Structured proofs panel */}
      {structuredDocs.length > 0 && (
        <SectionCard
          title="Structured Uploaded Proofs"
          subtitle="Proofs uploaded by the employee directly onto structured declaration entries."
        >
          <TableContainer
            component={Box}
            sx={{
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Declaration Entry</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File Size</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Uploaded Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {structuredDocs.map((doc) => {
                  const viewUrl = doc.url || getS3FileUrl(doc.s3Key);
                  
                  const handleView = () => {
                    window.open(viewUrl, "_blank", "noopener,noreferrer");
                  };

                  const handleDownload = () => {
                    downloadFile(viewUrl, doc.fileName);
                  };

                  const displaySection = doc.sectionCode.replace("SECTION_", "");

                  const displaySize = doc.fileSize
                    ? doc.fileSize > 1024 * 1024
                      ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : `${(doc.fileSize / 1024).toFixed(2)} KB`
                    : "—";

                  return (
                    <TableRow key={doc.docId} hover>
                      <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                        {displaySection}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {doc.entryName}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary", fontWeight: 500 }}>
                        {doc.fileName}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {displaySize}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title="Use for Verification Proofs List">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setPrefillData({
                                  section: normalizeSectionCode(doc.sectionCode),
                                  amount: doc.amount ?? 0,
                                  description: `${doc.entryName} - ${doc.fileName}`,
                                  referenceNo: "",
                                  proofDocKey: doc.s3Key,
                                });
                              }}
                            >
                              <MdPlaylistAdd size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View File">
                            <IconButton size="small" onClick={handleView} color="primary">
                              <MdVisibility size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download File">
                            <IconButton size="small" onClick={handleDownload} color="inherit">
                              <MdFileDownload size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}


      {/* Approve Dialog */}
      <ApprovalDialog
        open={approveOpen}
        declaration={declaration}
        onClose={() => { setApproveOpen(false); handleRefresh(); }}
      />

      {/* Reject Dialog */}
      <RejectionDialog
        open={rejectOpen}
        declaration={declaration}
        onClose={() => { setRejectOpen(false); handleRefresh(); }}
      />
    </Box>
  );
}

// ─── DOCUMENTS TAB PANEL ──────────────────────────────────────────────────────
interface PersistedDoc {
  id: string;
  type: string;
  name: string;
  fileKey: string;
  uploadedAt: string;
  size: number;
}

const DOCUMENT_TYPES = [
  "Offer Letter",
  "PAN Card",
  "Aadhaar Card",
  "Bank Passbook",
  "Form 16",
  "Resume",
  "Certificate",
];

function DocumentsTabPanel({ employeeId }: { employeeId: string }) {
  const uploadMutation = useUploadPreviousEmploymentFile();
  const [docs, setDocs] = useState<PersistedDoc[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    const list = localStorage.getItem(`emp_docs_${employeeId}`);
    if (list) {
      setDocs(JSON.parse(list));
    }
  }, [employeeId]);

  const saveDocs = (newList: PersistedDoc[]) => {
    localStorage.setItem(`emp_docs_${employeeId}`, JSON.stringify(newList));
    setDocs(newList);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    try {
      const res = await uploadMutation.mutateAsync(file);
      const fileKey = res.sourceFileKey || res.fileKey || res.key;
      if (!fileKey) throw new Error("Upload response missing file key");

      const newDoc: PersistedDoc = {
        id: crypto.randomUUID(),
        type,
        name: file.name,
        fileKey,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      saveDocs([newDoc, ...docs]);
      toast.success(`${type} uploaded successfully`);
    } catch (err) {
      toast.error(`Upload failed: ${getErrorMessage(err)}`);
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = (id: string) => {
    const newList = docs.filter((d) => d.id !== id);
    saveDocs(newList);
    toast.success("Document deleted");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Employee Folders & Documents</Typography>

      <Grid container spacing={3}>
        {/* Upload Buttons */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Upload Document Category">
            <Stack spacing={2} sx={{ pt: 1 }}>
              {DOCUMENT_TYPES.map((type) => {
                const uploading = uploadingType === type;
                return (
                  <Box key={type} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{type}</Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={uploading ? <CircularProgress size={14} /> : <MdUploadFile />}
                      disabled={!!uploadingType}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleUpload(e, type)}
                      />
                    </Button>
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Persisted list */}
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Active Documents Stream" subtitle="Uploaded S3 linked files metadata.">
            {docs.length === 0 ? (
              <EmptyState title="No Documents" description="No documents uploaded for this employee yet." />
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell align="right">Size</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {docs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{doc.type}</TableCell>
                        <TableCell sx={{ color: "primary.main" }}>{doc.name}</TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell align="right">{(doc.size / 1024).toFixed(1)} KB</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Tooltip title={`S3 Key: ${doc.fileKey}`}>
                              <IconButton size="small">
                                <MdVisibility size={16} />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
                              <MdDelete size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const { data: emp, isLoading, isError, refetch } = useEmployee(id);
  const { data: departments = [], isLoading: loadingDepts } = useDepartments();

  // Status updates
  const enableMutation = useEnableLogin();
  const disableMutation = useDisableLogin();
  const statusMutation = useUpdateEmployeeStatus();
  const updateMutation = useUpdateEmployee();

  // Status triggers menu
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loginEnabled = !!emp?.userId;

  const handleToggleLogin = () => {
    if (!id || !emp) return;
    const action = loginEnabled
      ? disableMutation.mutateAsync(id)
      : enableMutation.mutateAsync(id);

    action
      .then(() => {
        toast.success(loginEnabled ? "Self-service login disabled" : "Self-service login enabled");
        refetch();
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
      });
  };

  const handleStatusChange = (newStatus: EmployeeStatus) => {
    if (!id) return;
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus}`);
          setStatusMenuAnchor(null);
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const handleEditSubmit = (values: any) => {
    if (!id) return;
    const payload = {
      ...values,
      joinDate: values.joinDate ? new Date(values.joinDate).toISOString() : undefined,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
    };
    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          toast.success("Employee details updated successfully");
          setEditOpen(false);
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AppPage>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <Skeleton variant="circular" width={72} height={72} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={200} height={28} />
            <Skeleton width={120} height={20} sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: "10px" }} />
      </AppPage>
    );
  }

  if (isError || !emp) {
    return (
      <AppPage>
        <ErrorState
          description="Unable to load employee details."
          onRetry={() => navigate(0)}
        />
      </AppPage>
    );
  }

  return (
    <AppPage maxWidth={1280}>
      {/* Back navigation */}
      <Box sx={{ mb: 1 }}>
        <Button
          component={RouterLink}
          to="/dashboard/employees"
          startIcon={<MdArrowBack size={16} />}
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            textTransform: "none",
            px: 0,
            "&:hover": { bgcolor: "transparent", color: "text.primary" },
          }}
        >
          Back to Employees
        </Button>
      </Box>

      {/* Identity Header Card */}
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          bgcolor: "background.paper",
          p: 2, // compact padding
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5, // 12px roughly
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initial(emp.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {emp.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {emp.designation || "No designation"} · {emp.employeeCode}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, alignItems: "center" }}>
              <StatusChip kind="employee" status={emp.status} />
              <Chip
                size="small"
                variant="outlined"
                color={loginEnabled ? "success" : "default"}
                label={loginEnabled ? "Login active" : "No login"}
                sx={{ height: 24 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Actions bar */}
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MdEdit />}
            onClick={() => setEditOpen(true)}
            sx={{ height: 40, borderRadius: "10px", textTransform: "none" }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
            sx={{ height: 40, borderRadius: "10px", textTransform: "none" }}
          >
            Change Status
          </Button>
          <Menu
            anchorEl={statusMenuAnchor}
            open={!!statusMenuAnchor}
            onClose={() => setStatusMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleStatusChange(EmployeeStatus.ACTIVE)}>Active</MenuItem>
            <MenuItem onClick={() => handleStatusChange(EmployeeStatus.RESIGNED)}>Resigned</MenuItem>
            <MenuItem onClick={() => handleStatusChange(EmployeeStatus.TERMINATED)}>Terminated</MenuItem>
          </Menu>

          <Button
            variant="contained"
            size="small"
            color={loginEnabled ? "error" : "primary"}
            onClick={handleToggleLogin}
            disabled={enableMutation.isPending || disableMutation.isPending}
            sx={{ height: 40, borderRadius: "10px", textTransform: "none" }}
          >
            {loginEnabled ? "Disable Login" : "Enable Login"}
          </Button>
        </Stack>
      </Box>

      {/* Tabs Container */}
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: "1px solid #E5E7EB", px: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Employee details tab group"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                minHeight: 48,
                px: 2,
                gap: 0.5,
              },
              "& .Mui-selected": { fontWeight: 600 },
              "& .MuiTabs-indicator": { height: 2, borderRadius: "2px 2px 0 0" },
            }}
          >
            {TABS.map(({ label, icon: Icon }, i) => (
              <Tab
                key={label}
                label={label}
                icon={<Icon size={16} />}
                iconPosition="start"
                id={`emp-tab-${i}`}
                aria-controls={`emp-tabpanel-${i}`}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          {tab === 0 && <OverviewTabPanel employeeId={id!} emp={emp} />}
          {tab === 1 && <PayrollTabPanel employeeId={id!} />}
          {tab === 2 && <PreviousEmploymentTabPanel employeeId={id!} />}
          {tab === 3 && <GratuityTabPanel employeeId={id!} employeeJoinDate={emp.joinDate} />}
          {tab === 4 && <ELEncashmentTabPanel employeeId={id!} employeeJoinDate={emp.joinDate} />}
          {tab === 5 && <TaxTabPanel employeeId={id!} />}
          {tab === 6 && <DocumentsTabPanel employeeId={id!} />}
        </Box>
      </Box>

      {/* Edit Form Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Employee Profile</DialogTitle>
        <DialogContent dividers>
          <EmployeeForm
            mode="edit"
            initialValues={{
              employeeCode: emp.employeeCode,
              name: emp.name,
              email: emp.email ?? "",
              phoneNumber: emp.phoneNumber ?? "",
              dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : "",
              gender: (emp.gender ?? "") as any,
              address: emp.address ?? "",
              designation: emp.designation ?? "",
              departmentId: emp.departmentId ?? "",
              joinDate: emp.joinDate ? emp.joinDate.slice(0, 10) : "",
              panNumber: emp.panNumber ?? "",
              aadhaarNo: emp.aadhaarNo ?? "",
            }}
            departments={departments}
            departmentsLoading={loadingDepts}
            onSubmit={handleEditSubmit}
            loading={updateMutation.isPending}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
