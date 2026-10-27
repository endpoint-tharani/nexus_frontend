import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdUploadFile,
  MdLock,
  MdEdit,
  MdRateReview,
  MdGroups,
  MdEventAvailable,
  MdBeachAccess,
  MdEventBusy,
  MdLockOutline,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { DataTable, StatCard, StatusChip } from "../../components/ui";
import {
  AttendanceBulkUploadDialog,
  AttendanceFilters,
  LockMonthDialog,
  MarkAttendanceForm,
  RegularizationReviewDialog,
} from "../../components/attendance";
import {
  useAttendanceDashboard,
  useAttendanceList,
  useMarkAttendance,
  useRegularizations,
} from "../../hooks/attendance";
import { useEmployees } from "../../hooks/employee";
import { useCurrentRole, useMe } from "../../hooks/user";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import {
  ATTENDANCE_SOURCE_LABELS,
  AttendanceStatus,
  CompanyRole,
  REGULARIZATION_STATUS_OPTIONS,
  RegularizationStatus,
  type AttendanceStatus as AttendanceStatusType,
  type RegularizationStatus as RegularizationStatusType,
} from "../../constants/enums";
import type {
  AttendanceRow,
  MarkAttendancePayload,
  RegularizationRow,
} from "../../types";
import type { MarkAttendanceFormData } from "../../schemas/attendance.schema";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils";

type Tab = "log" | "regularizations";

const EMPLOYEE_FETCH_LIMIT = 500;
const LIST_PAGE_SIZE = 200;

const clean = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

// HH:MM AM/PM from an ISO datetime, or "—".
const toTime = (value?: string | null): string =>
  value ? formatDate(value, "h:mm A") : "—";

export default function Attendance() {
  const role = useCurrentRole();
  // The page is role-guarded to OWNER/ADMIN/HR; finer write permissions
  // (mark/lock/approve) are enforced by the backend, surfaced via toasts.
  const canManage = !!role && role !== CompanyRole.EMPLOYEE;

  const companyId = useCompanyId();
  const { data: me } = useMe();
  const needsCompanySetup =
    role === CompanyRole.OWNER &&
    !companyId &&
    !!me &&
    !me.companyId &&
    !me.company?.id;

  const [tab, setTab] = useState<Tab>("log");

  // --- Log filters ---
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<AttendanceStatusType | "">("");

  // --- Regularization filter ---
  const [regStatus, setRegStatus] = useState<RegularizationStatusType | "">(
    RegularizationStatus.PENDING
  );

  // --- Dialog state ---
  const [markOpen, setMarkOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AttendanceRow | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<RegularizationRow | null>(
    null
  );

  // --- Data ---
  const { data: employees = [] } = useEmployees({ limit: EMPLOYEE_FETCH_LIMIT });
  const { data: dashboard } = useAttendanceDashboard(date);

  const { data: log, isLoading: logLoading, isError: logError, refetch: refetchLog } =
    useAttendanceList({
      from: date,
      to: date,
      pageSize: LIST_PAGE_SIZE,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
    });

  const {
    data: regs,
    isLoading: regsLoading,
    isError: regsError,
    refetch: refetchRegs,
  } = useRegularizations(
    { pageSize: LIST_PAGE_SIZE, ...(regStatus ? { status: regStatus } : {}) },
    { enabled: tab === "regularizations" }
  );

  const markMutation = useMarkAttendance();

  // --- Mark form ---
  const markInitialValues = useMemo<MarkAttendanceFormData>(
    () => ({
      employeeId: editingRow?.employeeId ?? "",
      date: editingRow ? dayjs(editingRow.date).format("YYYY-MM-DD") : date,
      status: editingRow?.status ?? AttendanceStatus.PRESENT,
      isPaid: editingRow?.isPaid,
      remarks: editingRow?.remarks ?? "",
    }),
    [editingRow, date]
  );

  const openMark = (row?: AttendanceRow) => {
    setEditingRow(row ?? null);
    setMarkOpen(true);
  };

  const closeMark = () => {
    if (markMutation.isPending) return;
    setMarkOpen(false);
  };

  const handleMarkSubmit = (values: MarkAttendanceFormData) => {
    const payload: MarkAttendancePayload = {
      employeeId: values.employeeId,
      date: values.date,
      status: values.status,
      remarks: clean(values.remarks),
      ...(values.status === AttendanceStatus.LEAVE
        ? { isPaid: values.isPaid ?? true }
        : {}),
    };
    markMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Attendance saved");
        setMarkOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  // --- Columns ---
  const logColumns = useMemo<ColumnDef<AttendanceRow>[]>(
    () => [
      {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.employee?.name ?? "—"}
            </Typography>
            {row.original.employee?.employeeCode && (
              <Typography variant="caption" color="text.secondary">
                {row.original.employee.employeeCode}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusChip kind="attendance" status={row.original.status} />
        ),
      },
      {
        id: "checkIn",
        header: "Check-in",
        cell: ({ row }) => toTime(row.original.checkIn),
      },
      {
        id: "checkOut",
        header: "Check-out",
        cell: ({ row }) => toTime(row.original.checkOut),
      },
      {
        accessorKey: "dayValue",
        header: "Day",
        meta: { align: "right" },
        cell: ({ row }) => row.original.dayValue,
      },
      {
        id: "paid",
        header: "Paid",
        cell: ({ row }) =>
          row.original.isPaid ? (
            <Typography variant="body2" color="success.main">
              Yes
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No
            </Typography>
          ),
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => ATTENDANCE_SOURCE_LABELS[row.original.source] ?? "—",
      },
      {
        id: "locked",
        header: "",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isLocked ? (
            <Tooltip title="Locked (month closed)">
              <Box component="span" sx={{ color: "text.disabled", display: "inline-flex" }}>
                <MdLockOutline size={16} />
              </Box>
            </Tooltip>
          ) : null,
      },
    ],
    []
  );

  const regColumns = useMemo<ColumnDef<RegularizationRow>[]>(
    () => [
      {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.employee?.name ?? row.original.employeeId}
            </Typography>
            {row.original.employee?.employeeCode && (
              <Typography variant="caption" color="text.secondary">
                {row.original.employee.employeeCode}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: "requested",
        header: "Requested",
        cell: ({ row }) => (
          <StatusChip kind="attendance" status={row.original.requestedStatus} />
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <Tooltip title={row.original.reason}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.original.reason}
            </Typography>
          </Tooltip>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusChip kind="regularization" status={row.original.status} />
        ),
      },
      {
        id: "submitted",
        header: "Submitted",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    []
  );

  const period = dayjs(date);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 112px)",
      }}
    >
      {needsCompanySetup && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/dashboard/company"
            >
              Set up company
            </Button>
          }
        >
          You don't have an active company yet. Create your company before
          managing attendance.
        </Alert>
      )}

      {/* Tab switcher — proper MUI Tabs */}
      <Box sx={{ borderBottom: "1px solid #E5E7EB", mb: 2.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as Tab)}
          aria-label="Attendance tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              minHeight: 44,
            },
            "& .Mui-selected": { fontWeight: 600 },
            "& .MuiTabs-indicator": { height: 2, borderRadius: "2px 2px 0 0" },
          }}
        >
          <Tab value="log" label="Daily Log" id="att-tab-log" aria-controls="att-panel-log" />
          <Tab value="regularizations" label="Regularizations" id="att-tab-reg" aria-controls="att-panel-reg" />
        </Tabs>
      </Box>

      {tab === "log" && (
        <>
          {/* KPI cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 2,
            }}
          >
            <StatCard
              label="Marked"
              value={dashboard?.headcountMarked ?? 0}
              icon={<MdGroups size={22} />}
              color="primary"
            />
            <StatCard
              label="Present"
              value={dashboard?.present ?? 0}
              icon={<MdEventAvailable size={22} />}
              color="success"
            />
            <StatCard
              label="On leave"
              value={dashboard?.onLeave ?? 0}
              icon={<MdBeachAccess size={22} />}
              color="info"
            />
            <StatCard
              label="Absent"
              value={dashboard?.absent ?? 0}
              icon={<MdEventBusy size={22} />}
              color="error"
            />
          </Box>

          <AttendanceFilters
            date={date}
            employeeId={employeeId}
            status={status}
            employees={employees}
            onDateChange={setDate}
            onEmployeeChange={setEmployeeId}
            onStatusChange={setStatus}
            actions={
              canManage ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<MdLock size={18} />}
                    onClick={() => setLockOpen(true)}
                  >
                    Lock month
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MdUploadFile size={18} />}
                    onClick={() => setBulkOpen(true)}
                  >
                    Bulk Upload
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<MdAdd size={18} />}
                    onClick={() => openMark()}
                  >
                    Mark Attendance
                  </Button>
                </>
              ) : undefined
            }
          />

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <DataTable
              columns={logColumns}
              data={log?.items ?? []}
              loading={logLoading}
              error={logError ? "Failed to load attendance." : null}
              onRetry={() => refetchLog()}
              fillHeight
              emptyTitle="No attendance for this day"
              emptyDescription={
                canManage
                  ? "Mark attendance, upload a sheet, or pick another date."
                  : "Nothing recorded for the selected filters."
              }
              ariaLabel="Attendance log"
              rowActions={
                canManage
                  ? (row) => (
                      <Tooltip title={row.isLocked ? "Month locked" : "Edit"}>
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Edit attendance"
                            disabled={row.isLocked}
                            onClick={() => openMark(row)}
                          >
                            <MdEdit size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )
                  : undefined
              }
            />
          </Box>
        </>
      )}

      {tab === "regularizations" && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              select
              label="Status"
              value={regStatus}
              onChange={(e) =>
                setRegStatus(e.target.value as RegularizationStatusType | "")
              }
              sx={{ width: { xs: "100%", sm: 220 } }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {REGULARIZATION_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <DataTable
              columns={regColumns}
              data={regs?.items ?? []}
              loading={regsLoading}
              error={regsError ? "Failed to load regularizations." : null}
              onRetry={() => refetchRegs()}
              fillHeight
              emptyTitle="No regularization requests"
              emptyDescription="Correction requests from employees will appear here."
              ariaLabel="Regularization requests"
              rowActions={
                canManage
                  ? (row) =>
                      row.status === RegularizationStatus.PENDING ? (
                        <Tooltip title="Review">
                          <IconButton
                            size="small"
                            aria-label="Review regularization"
                            onClick={() => setReviewTarget(row)}
                          >
                            <MdRateReview size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null
                  : undefined
              }
            />
          </Box>
        </>
      )}

      {/* Dialogs (manager-only) */}
      {canManage && (
        <>
          <Dialog open={markOpen} onClose={closeMark} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {editingRow ? "Edit Attendance" : "Mark Attendance"}
            </DialogTitle>
            <DialogContent>
              <MarkAttendanceForm
                employees={employees}
                initialValues={markInitialValues}
                onSubmit={handleMarkSubmit}
                loading={markMutation.isPending}
                onCancel={closeMark}
              />
            </DialogContent>
          </Dialog>

          <AttendanceBulkUploadDialog
            open={bulkOpen}
            onClose={() => setBulkOpen(false)}
          />

          <LockMonthDialog
            open={lockOpen}
            onClose={() => setLockOpen(false)}
            defaultMonth={period.month() + 1}
            defaultYear={period.year()}
          />

          <RegularizationReviewDialog
            request={reviewTarget}
            onClose={() => setReviewTarget(null)}
          />
        </>
      )}
    </Box>
  );
}
