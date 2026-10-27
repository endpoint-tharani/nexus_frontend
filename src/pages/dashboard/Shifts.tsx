import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TablePagination,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdFileDownload,
  MdMoreVert,
  MdSwapHoriz,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import { PageHeader, DataTable, ConfirmDialog } from "../../components/ui";
import ShiftForm from "../../components/shift/ShiftForm";
import ShiftFilters from "../../components/shift/ShiftFilters";
import AssignShiftForm from "../../components/shift/AssignShiftForm";
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useAssignShift,
  useShiftHistory,
  useCurrentShiftReport,
  useWeeklyOffReport,
} from "../../hooks/shift";
import { useBranches } from "../../hooks/branch";
import { useEmployees } from "../../hooks/employee";
import { useCurrentRole } from "../../hooks/user/useCurrentRole";
import {
  CompanyRole,
  SHIFT_TYPE_COLORS,
  SHIFT_TYPE_LABELS,
} from "../../constants/enums";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../constants/app";
import type { ShiftType } from "../../constants/enums";
import type {
  Branch,
  CreateShiftPayload,
  CurrentShiftReportRow,
  Shift,
  ShiftReportParams,
  UpdateShiftPayload,
  WeeklyOffReportRow,
} from "../../types";
import type { ShiftFormData, AssignShiftFormData } from "../../schemas/shift.schema";
import {
  downloadCsv,
  formatShiftTime,
  formatWeeklyOff,
  getErrorMessage,
  minutesToTime,
  timeToMinutes,
} from "../../utils";

const { OWNER, ADMIN, HR } = CompanyRole;
const MANAGER_ROLES: string[] = [OWNER, ADMIN, HR];

type TabKey = "shifts" | "assignments" | "reports";
type ReportKey = "current" | "weeklyOff";

// Map a Shift record to the HH:mm-based form shape used by ShiftForm.
const shiftToFormValues = (shift: Shift): ShiftFormData => ({
  name: shift.name,
  code: shift.code,
  type: shift.type,
  branchId: shift.branchId ?? "",
  startTime: minutesToTime(shift.startTimeMin),
  endTime: minutesToTime(shift.endTimeMin),
  graceMinutes: shift.graceMinutes,
  breakMinutes: shift.breakMinutes,
  fullDayMinutes: shift.fullDayMinutes,
  halfDayMinutes: shift.halfDayMinutes,
  weeklyOffPattern: shift.weeklyOffPattern,
  isActive: shift.isActive,
});

// Map the form shape to a create/update payload (HH:mm -> minutes).
const formValuesToPayload = (values: ShiftFormData): CreateShiftPayload => ({
  name: values.name,
  code: values.code,
  type: values.type,
  branchId: values.branchId || undefined,
  startTimeMin: values.type === "FLEXIBLE" ? null : timeToMinutes(values.startTime),
  endTimeMin: values.type === "FLEXIBLE" ? null : timeToMinutes(values.endTime),
  graceMinutes: values.graceMinutes,
  breakMinutes: values.breakMinutes,
  fullDayMinutes: values.fullDayMinutes,
  halfDayMinutes: values.halfDayMinutes,
  weeklyOffPattern: values.weeklyOffPattern,
});

export default function Shifts() {
  const role = useCurrentRole();
  const canManage = !!role && MANAGER_ROLES.includes(role);

  const [tab, setTab] = useState<TabKey>("shifts");

  // --- list filters + server pagination ---
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ShiftType | "">("");
  const [branchId, setBranchId] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  // Reset to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, type, branchId, includeInactive, pageSize]);

  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const branchName = useMemo(() => {
    const map = new Map(branches.map((b) => [b.id, b.name]));
    return (id?: string | null) => (id ? map.get(id) ?? "—" : "All branches");
  }, [branches]);

  const listQuery = useShifts({
    page,
    pageSize,
    search: search || undefined,
    type: type || undefined,
    branchId: branchId || undefined,
    includeInactive,
  });
  const shifts = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;

  // All active shifts (for the assign + report pickers).
  const { data: activeShiftData } = useShifts({ pageSize: 200 });
  const activeShifts = useMemo(
    () => (activeShiftData?.items ?? []).filter((s) => s.isActive),
    [activeShiftData]
  );

  // --- mutations ---
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const deleteMutation = useDeleteShift();
  const assignMutation = useAssignShift();

  // --- dialogs ---
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState<Shift | null>(null);

  // --- row action menu ---
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuShift, setMenuShift] = useState<Shift | null>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>, shift: Shift) => {
    setMenuAnchor(e.currentTarget);
    setMenuShift(shift);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuShift(null);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (shift: Shift) => {
    setFormMode("edit");
    setEditing(shift);
    setFormOpen(true);
    closeMenu();
  };

  const handleSubmit = (values: ShiftFormData) => {
    const payload = formValuesToPayload(values);
    if (formMode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Shift created");
          setFormOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      });
    } else if (editing) {
      const updatePayload: UpdateShiftPayload = {
        ...payload,
        branchId: values.branchId || null,
        isActive: values.isActive ?? true,
      };
      updateMutation.mutate(
        { id: editing.id, data: updatePayload },
        {
          onSuccess: () => {
            toast.success("Shift updated");
            setFormOpen(false);
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Shift deleted");
        setDeleting(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const exportShiftsCsv = () => {
    downloadCsv(
      "shifts",
      ["Code", "Name", "Type", "Timing", "Grace (min)", "Weekly off", "Branch", "Status"],
      shifts.map((s) => [
        s.code,
        s.name,
        SHIFT_TYPE_LABELS[s.type],
        formatShiftTime(s.startTimeMin, s.endTimeMin),
        s.graceMinutes,
        formatWeeklyOff(s.weeklyOffPattern),
        branchName(s.branchId),
        s.isActive ? "Active" : "Inactive",
      ])
    );
  };

  const columns = useMemo<ColumnDef<Shift>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Chip
            size="small"
            label={SHIFT_TYPE_LABELS[row.original.type]}
            color={SHIFT_TYPE_COLORS[row.original.type]}
            variant="outlined"
          />
        ),
      },
      {
        id: "timing",
        header: "Timing",
        cell: ({ row }) =>
          formatShiftTime(row.original.startTimeMin, row.original.endTimeMin),
      },
      {
        id: "weeklyOff",
        header: "Weekly off",
        cell: ({ row }) => formatWeeklyOff(row.original.weeklyOffPattern),
      },
      {
        id: "branch",
        header: "Branch",
        cell: ({ row }) => branchName(row.original.branchId),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            size="small"
            label={row.original.isActive ? "Active" : "Inactive"}
            color={row.original.isActive ? "success" : "default"}
          />
        ),
      },
    ],
    [branchName]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <PageHeader
        title="Shifts"
        subtitle="Define shift timings, weekly-offs, assign employees and run shift reports."
      />

      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setTab(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="shifts" label="Shifts" />
        <Tab value="assignments" label="Assignments & history" />
        <Tab value="reports" label="Reports" />
      </Tabs>

      {tab === "shifts" && (
        <Box>
          <ShiftFilters
            search={searchInput}
            type={type}
            branchId={branchId}
            includeInactive={includeInactive}
            branches={branches}
            branchesLoading={branchesLoading}
            onSearchChange={setSearchInput}
            onTypeChange={setType}
            onBranchChange={setBranchId}
            onIncludeInactiveChange={setIncludeInactive}
            actions={
              <>
                <Button
                  variant="outlined"
                  startIcon={<MdFileDownload />}
                  onClick={exportShiftsCsv}
                  disabled={shifts.length === 0}
                >
                  Export CSV
                </Button>
                {canManage && (
                  <Button variant="contained" startIcon={<MdAdd />} onClick={openCreate}>
                    Create shift
                  </Button>
                )}
              </>
            }
          />

          <DataTable
            columns={columns}
            data={shifts}
            loading={listQuery.isLoading}
            error={listQuery.isError ? "Failed to load shifts." : null}
            onRetry={() => listQuery.refetch()}
            enablePagination={false}
            emptyTitle="No shifts found"
            emptyDescription="Create your first shift to get started."
            rowActions={
              canManage
                ? (shift) => (
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => openMenu(e, shift)}>
                        <MdMoreVert />
                      </IconButton>
                    </Tooltip>
                  )
                : undefined
            }
          />

          {meta && meta.total > 0 && (
            <TablePagination
              component="div"
              count={meta.total}
              page={meta.page - 1}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
              onPageChange={(_, next) => setPage(next + 1)}
              onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))}
            />
          )}
        </Box>
      )}

      {tab === "assignments" && (
        <AssignmentsPanel
          shifts={activeShifts}
          assignPending={assignMutation.isPending}
          onAssign={(values, done) =>
            assignMutation.mutate(
              {
                employeeId: values.employeeId,
                shiftId: values.shiftId,
                effectiveFrom: values.effectiveFrom,
                note: values.note || undefined,
              },
              {
                onSuccess: () => {
                  toast.success("Shift assigned");
                  done();
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              }
            )
          }
        />
      )}

      {tab === "reports" && <ReportsPanel branches={branches} shifts={activeShifts} />}

      {/* Row action menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => menuShift && openEdit(menuShift)}>
          <MdEdit style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleting(menuShift);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <MdDelete style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formMode === "create" ? "Create shift" : "Edit shift"}</DialogTitle>
        <DialogContent dividers>
          <ShiftForm
            mode={formMode}
            initialValues={editing ? shiftToFormValues(editing) : undefined}
            branches={branches}
            branchesLoading={branchesLoading}
            onSubmit={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete shift"
        message={
          deleting
            ? `Delete shift "${deleting.name}" (${deleting.code})? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Assignments & history tab.
// ---------------------------------------------------------------------------
function AssignmentsPanel({
  shifts,
  assignPending,
  onAssign,
}: {
  shifts: Shift[];
  assignPending: boolean;
  onAssign: (values: AssignShiftFormData, done: () => void) => void;
}) {
  const { data: employees = [], isLoading: employeesLoading } = useEmployees({
    limit: 500,
  });
  const [historyEmployeeId, setHistoryEmployeeId] = useState("");
  const { data: history, isLoading: historyLoading } = useShiftHistory(
    historyEmployeeId || undefined
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
      }}
    >
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Assign a shift
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Assigning a shift closes the employee's current assignment and keeps full
          history.
        </Typography>
        <AssignShiftForm
          employees={employees}
          employeesLoading={employeesLoading}
          shifts={shifts}
          loading={assignPending}
          onSubmit={(values) => onAssign(values, () => undefined)}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Shift history
        </Typography>
        <TextField
          select
          label="Employee"
          value={historyEmployeeId}
          onChange={(e) => setHistoryEmployeeId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select an employee</MenuItem>
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.name}
              {employee.employeeCode ? ` (${employee.employeeCode})` : ""}
            </MenuItem>
          ))}
        </TextField>

        {!historyEmployeeId && (
          <Typography variant="body2" color="text.secondary">
            Select an employee to view their current shift and change history.
          </Typography>
        )}

        {historyEmployeeId && historyLoading && (
          <Typography variant="body2" color="text.secondary">
            Loading history…
          </Typography>
        )}

        {historyEmployeeId && history && (
          <Box>
            <Alert severity={history.active ? "info" : "warning"} sx={{ mb: 2 }}>
              {history.active
                ? `Current shift: ${history.active.shift?.name ?? "—"} (from ${history.active.effectiveFrom.slice(0, 10)})`
                : "No active shift assignment."}
            </Alert>

            <Divider sx={{ mb: 1 }} />
            <Stack spacing={1}>
              {history.history.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No assignment history.
                </Typography>
              )}
              {history.history.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    borderRadius: 1,
                    bgcolor: row.isActive ? "action.selected" : "transparent",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.shift?.name ?? "—"}{" "}
                      {row.shift?.code ? `(${row.shift.code})` : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.effectiveFrom.slice(0, 10)} →{" "}
                      {row.effectiveTo ? row.effectiveTo.slice(0, 10) : "current"}
                    </Typography>
                  </Box>
                  {row.isActive && <Chip size="small" color="success" label="Active" />}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Reports tab (Current Shift + Weekly Off).
// ---------------------------------------------------------------------------
function ReportsPanel({ branches, shifts }: { branches: Branch[]; shifts: Shift[] }) {
  const [report, setReport] = useState<ReportKey>("current");
  const [reportBranchId, setReportBranchId] = useState("");
  const [reportShiftId, setReportShiftId] = useState("");
  const [reportSearchInput, setReportSearchInput] = useState("");
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => setReportSearch(reportSearchInput), 300);
    return () => window.clearTimeout(handle);
  }, [reportSearchInput]);

  const filters: ShiftReportParams = {
    branchId: reportBranchId || undefined,
    shiftId: reportShiftId || undefined,
    search: reportSearch || undefined,
  };

  const currentReport = useCurrentShiftReport(filters, {
    enabled: report === "current",
  });
  const weeklyOffReport = useWeeklyOffReport(filters, {
    enabled: report === "weeklyOff",
  });

  const currentColumns = useMemo<ColumnDef<CurrentShiftReportRow>[]>(
    () => [
      { accessorKey: "employeeCode", header: "Code" },
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.employeeName}
          </Typography>
        ),
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => row.original.departmentName ?? "—",
      },
      {
        id: "shift",
        header: "Shift",
        cell: ({ row }) => `${row.original.shiftName} (${row.original.shiftCode})`,
      },
      {
        id: "timing",
        header: "Timing",
        cell: ({ row }) =>
          formatShiftTime(row.original.startTimeMin, row.original.endTimeMin),
      },
      {
        id: "weeklyOff",
        header: "Weekly off",
        cell: ({ row }) =>
          row.original.weeklyOffDays.length ? row.original.weeklyOffDays.join(", ") : "None",
      },
      {
        id: "effectiveFrom",
        header: "Since",
        cell: ({ row }) => row.original.effectiveFrom.slice(0, 10),
      },
    ],
    []
  );

  const weeklyOffColumns = useMemo<ColumnDef<WeeklyOffReportRow>[]>(
    () => [
      { accessorKey: "employeeCode", header: "Code" },
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.employeeName}
          </Typography>
        ),
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => row.original.departmentName ?? "—",
      },
      {
        id: "shift",
        header: "Shift",
        cell: ({ row }) => `${row.original.shiftName} (${row.original.shiftCode})`,
      },
      {
        id: "weeklyOff",
        header: "Weekly off days",
        cell: ({ row }) =>
          row.original.weeklyOffDays.length ? row.original.weeklyOffDays.join(", ") : "None",
      },
    ],
    []
  );

  const exportCurrent = () => {
    const rows = currentReport.data?.rows ?? [];
    downloadCsv(
      "current-shift-report",
      ["Code", "Employee", "Department", "Shift", "Shift code", "Timing", "Weekly off", "Since"],
      rows.map((r) => [
        r.employeeCode,
        r.employeeName,
        r.departmentName ?? "",
        r.shiftName,
        r.shiftCode,
        formatShiftTime(r.startTimeMin, r.endTimeMin),
        r.weeklyOffDays.join(" / "),
        r.effectiveFrom.slice(0, 10),
      ])
    );
  };

  const exportWeeklyOff = () => {
    const rows = weeklyOffReport.data?.rows ?? [];
    downloadCsv(
      "weekly-off-report",
      ["Code", "Employee", "Department", "Shift", "Shift code", "Weekly off days"],
      rows.map((r) => [
        r.employeeCode,
        r.employeeName,
        r.departmentName ?? "",
        r.shiftName,
        r.shiftCode,
        r.weeklyOffDays.join(" / "),
      ])
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          gap: 2,
          alignItems: { sm: "center" },
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          value={report}
          exclusive
          size="small"
          onChange={(_, value: ReportKey | null) => value && setReport(value)}
        >
          <ToggleButton value="current">Current shift</ToggleButton>
          <ToggleButton value="weeklyOff">Weekly off</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Search"
          placeholder="Employee or shift"
          value={reportSearchInput}
          onChange={(e) => setReportSearchInput(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 220 } }}
        />
        <TextField
          select
          label="Branch"
          size="small"
          value={reportBranchId}
          onChange={(e) => setReportBranchId(e.target.value)}
          sx={{ width: { xs: "100%", sm: 180 } }}
        >
          <MenuItem value="">All branches</MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Shift"
          size="small"
          value={reportShiftId}
          onChange={(e) => setReportShiftId(e.target.value)}
          sx={{ width: { xs: "100%", sm: 200 } }}
        >
          <MenuItem value="">All shifts</MenuItem>
          {shifts.map((shift) => (
            <MenuItem key={shift.id} value={shift.id}>
              {shift.name} ({shift.code})
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          startIcon={<MdFileDownload />}
          onClick={report === "current" ? exportCurrent : exportWeeklyOff}
          sx={{ ml: { sm: "auto" } }}
        >
          Export CSV
        </Button>
      </Box>

      {report === "current" ? (
        <DataTable
          columns={currentColumns}
          data={currentReport.data?.rows ?? []}
          loading={currentReport.isLoading}
          error={currentReport.isError ? "Failed to load report." : null}
          onRetry={() => currentReport.refetch()}
          emptyTitle="No assigned employees"
          emptyDescription="Assign shifts to employees to populate this report."
        />
      ) : (
        <Box>
          {weeklyOffReport.data && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              {weeklyOffReport.data.byWeekday.map((d) => (
                <Chip
                  key={d.index}
                  label={`${d.day}: ${d.employeeCount}`}
                  size="small"
                  variant="outlined"
                  icon={<MdSwapHoriz />}
                />
              ))}
            </Stack>
          )}
          <DataTable
            columns={weeklyOffColumns}
            data={weeklyOffReport.data?.rows ?? []}
            loading={weeklyOffReport.isLoading}
            error={weeklyOffReport.isError ? "Failed to load report." : null}
            onRetry={() => weeklyOffReport.refetch()}
            emptyTitle="No assigned employees"
            emptyDescription="Assign shifts to employees to populate this report."
          />
        </Box>
      )}
    </Box>
  );
}
