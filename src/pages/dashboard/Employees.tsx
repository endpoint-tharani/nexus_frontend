import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdUploadFile,
  MdVisibility,
  MdMoreVert,
  MdEdit,
  MdLogin,
  MdLogout,
  MdManageAccounts,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import { Link as RouterLink } from "react-router-dom";
import toast from "react-hot-toast";

import {
  DataTable,
  StatusChip,
  ConfirmDialog,
} from "../../components/ui";
import {
  BulkUploadDialog,
  EmployeeDetailDrawer,
  EmployeeFilters,
  EmployeeForm,
} from "../../components/employee";
import {
  useCreateEmployee,
  useDisableAllLogins,
  useDisableLogin,
  useEmployees,
  useEnableAllLogins,
  useEnableLogin,
  useUpdateEmployee,
  useUpdateEmployeeStatus,
} from "../../hooks/employee";
import { useDepartments } from "../../hooks/department";
import { useCurrentRole, useMe } from "../../hooks/user";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { useProofUploadWindow, useSetProofUploadWindow } from "../../hooks/taxConfig";
import { getFinancialYear } from "../../utils/format";
import {
  CompanyRole,
  EMPLOYEE_STATUS_OPTIONS,
  type EmployeeStatus,
} from "../../constants/enums";
import type {
  BulkDisableLoginResult,
  BulkEnableLoginResult,
  CreateEmployeePayload,
  Employee,
  EmployeeListParams,
} from "../../types";
import type { EmployeeFormData } from "../../schemas/employee.schema";
import { getErrorMessage } from "../../utils";

type FormMode = "create" | "edit";

// The result of a "for all" login action — tagged so one dialog renders both.
type BulkLoginResult =
  | { kind: "enable"; data: BulkEnableLoginResult }
  | { kind: "disable"; data: BulkDisableLoginResult };

const SEARCH_DEBOUNCE_MS = 300;

// Employees load in a single fetch and paginate client-side (like Tax
// Declarations), so the table footer can show the same rows-per-page control.
// Companies above this size are rare; revisit with server paging if that changes.
const EMPLOYEE_FETCH_LIMIT = 500;

const clean = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

// ISO date (YYYY-MM-DD) for a date <input> from a backend ISO datetime.
const toDateInput = (value?: string | null): string =>
  value ? value.slice(0, 10) : "";

// A date <input> value -> full ISO-8601 datetime (the backend validates
// `z.string().datetime()`); empty/invalid -> undefined so it's omitted.
const toIsoDate = (value?: string): string | undefined => {
  const v = value?.trim();
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

const toFormValues = (employee: Employee | null): EmployeeFormData => ({
  employeeCode: employee?.employeeCode ?? "",
  name: employee?.name ?? "",
  email: employee?.email ?? "",
  phoneNumber: employee?.phoneNumber ?? "",
  dateOfBirth: toDateInput(employee?.dateOfBirth),
  gender: (employee?.gender ?? "") as EmployeeFormData["gender"],
  address: employee?.address ?? "",
  designation: employee?.designation ?? "",
  departmentId: employee?.departmentId ?? "",
  joinDate: toDateInput(employee?.joinDate),
  panNumber: employee?.panNumber ?? "",
  aadhaarNo: employee?.aadhaarNo ?? "",
});

const toPayload = (values: EmployeeFormData): CreateEmployeePayload => ({
  employeeCode: values.employeeCode.trim(),
  name: values.name.trim(),
  email: clean(values.email),
  phoneNumber: clean(values.phoneNumber),
  designation: clean(values.designation),
  departmentId: clean(values.departmentId),
  joinDate: toIsoDate(values.joinDate),
  dateOfBirth: toIsoDate(values.dateOfBirth),
  gender: values.gender ? values.gender : undefined,
  address: clean(values.address),
  panNumber: clean(values.panNumber),
  aadhaarNo: clean(values.aadhaarNo),
});

const httpStatusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;

export default function Employees() {
  const role = useCurrentRole();
  // The backend gates every employee write behind the company OWNER (root user)
  // via `verifyCompanyRootAccess`. ADMIN/HR can view but not mutate, so we hide
  // (not disable) write controls for them and show a read-only notice.
  const canManage = role === CompanyRole.OWNER;
  const isViewer = !canManage && role !== undefined;

  // An OWNER can exist with no company yet (e.g. before onboarding / after the
  // previous company was deleted). Every employee write is company-scoped, so
  // without an active company the list never loads and the write controls would
  // dead-end (`requireCompanyId` throws before any request fires). Detect this
  // straight from `/user/me` so we can guide the owner to create a company
  // instead of showing an empty table behind buttons that can't work.
  const companyId = useCompanyId();
  const { data: me } = useMe();
  const needsCompanySetup =
    canManage && !companyId && !!me && !me.companyId && !me.company?.id;
  // Only surface write controls once an active company exists.
  const canWrite = canManage && !needsCompanySetup;

  // --- Filters (search debounced into the query key) ---
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const filters: EmployeeListParams = {
    limit: EMPLOYEE_FETCH_LIMIT,
    ...(search ? { search } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(status ? { status } : {}),
  };

  const { data: employees = [], isLoading, isError, refetch } =
    useEmployees(filters);

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const statusMutation = useUpdateEmployeeStatus();
  const enableLoginMutation = useEnableLogin();
  const disableLoginMutation = useDisableLogin();
  const enableAllMutation = useEnableAllLogins();
  const disableAllMutation = useDisableAllLogins();
  const submitting = createMutation.isPending || updateMutation.isPending;

  // --- Proof Upload Window state & hooks ---
  const currentFY = getFinancialYear(new Date());
  const { data: proofWindow, isLoading: proofLoading } = useProofUploadWindow(currentFY);
  const toggleProofWindow = useSetProofUploadWindow();
  const isProofOpen = proofWindow ? proofWindow.proofUploadOpen : false;

  const handleToggleProof = () => {
    toggleProofWindow.mutate(
      {
        year: currentFY,
        proofUploadOpen: !isProofOpen,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Proof upload window is now ${res.proofUploadOpen ? "OPEN" : "CLOSED"}`
          );
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  // --- Dialog / drawer / menu state ---
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    employee: Employee;
    status: EmployeeStatus;
  } | null>(null);
  const [enableLoginTarget, setEnableLoginTarget] = useState<Employee | null>(null);
  const [disableLoginTarget, setDisableLoginTarget] = useState<Employee | null>(null);
  const [bulkLoginConfirm, setBulkLoginConfirm] = useState<"enable" | "disable" | null>(
    null
  );
  const [bulkLoginResult, setBulkLoginResult] = useState<BulkLoginResult | null>(null);
  const [menu, setMenu] = useState<{
    anchorEl: HTMLElement;
    employee: Employee;
  } | null>(null);
  const [loginMenuAnchor, setLoginMenuAnchor] = useState<HTMLElement | null>(null);

  const formInitialValues = useMemo(() => toFormValues(editing), [editing]);

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setFormMode("edit");
    setEditing(employee);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
  };

  const handleSubmit = (values: EmployeeFormData) => {
    const payload = toPayload(values);

    if (formMode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Employee created");
          setFormOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      });
      return;
    }

    if (!editing) return;
    updateMutation.mutate(
      { id: editing.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Employee updated");
          setFormOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleStatusConfirm = () => {
    if (!statusTarget) return;
    statusMutation.mutate(
      { id: statusTarget.employee.id, status: statusTarget.status },
      {
        onSuccess: () => {
          toast.success("Employee status updated");
          setStatusTarget(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleEnableLoginConfirm = () => {
    if (!enableLoginTarget) return;
    enableLoginMutation.mutate(enableLoginTarget.id, {
      onSuccess: () => {
        toast.success("Login enabled — the employee has been emailed");
        setEnableLoginTarget(null);
      },
      onError: (error) => {
        const code = httpStatusOf(error);
        if (code === 409) toast.error("Login is already enabled for this employee.");
        else if (code === 400)
          toast.error("Add an email for this employee before enabling login.");
        else toast.error(getErrorMessage(error));
        setEnableLoginTarget(null);
      },
    });
  };

  const handleDisableLoginConfirm = () => {
    if (!disableLoginTarget) return;
    disableLoginMutation.mutate(disableLoginTarget.id, {
      onSuccess: () => {
        toast.success("Login disabled — the employee can no longer sign in");
        setDisableLoginTarget(null);
      },
      onError: (error) => {
        const code = httpStatusOf(error);
        if (code === 400) toast.error("This employee doesn't have a login to disable.");
        else toast.error(getErrorMessage(error));
        setDisableLoginTarget(null);
      },
    });
  };

  const handleBulkLoginConfirm = () => {
    if (bulkLoginConfirm === "enable") {
      enableAllMutation.mutate(undefined, {
        onSuccess: (data) => {
          setBulkLoginConfirm(null);
          setBulkLoginResult({ kind: "enable", data });
          toast.success(
            `Login enabled for ${data.enabledCount} employee(s)` +
              (data.skippedCount ? `, ${data.skippedCount} skipped` : "")
          );
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setBulkLoginConfirm(null);
        },
      });
      return;
    }
    if (bulkLoginConfirm === "disable") {
      disableAllMutation.mutate(undefined, {
        onSuccess: (data) => {
          setBulkLoginConfirm(null);
          setBulkLoginResult({ kind: "disable", data });
          toast.success(
            `Login disabled for ${data.disabledCount} employee(s)` +
              (data.skippedCount ? `, ${data.skippedCount} skipped` : "")
          );
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setBulkLoginConfirm(null);
        },
      });
    }
  };

  const bulkLoginPending = enableAllMutation.isPending || disableAllMutation.isPending;

  const openMenu = (e: MouseEvent<HTMLElement>, employee: Employee) =>
    setMenu({ anchorEl: e.currentTarget, employee });
  const closeMenu = () => setMenu(null);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Employee ID",
        cell: ({ row }) => row.original.employeeCode || "—",
      },
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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => row.original.department?.name || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusChip kind="employee" status={row.original.status} />,
      },
      {
        id: "login",
        header: "Login",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.userId ? (
            <Chip size="small" color="success" variant="outlined" label="Enabled" />
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          ),
      },
    ],
    []
  );

  const hasFilters = !!(search || departmentId || status);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // Pin to the routed content area (viewport − topbar 64px − page padding
        // 48px) with a FIXED height so the table body scrolls internally and the
        // pagination footer stays put — the page itself never scrolls.
        height: "calc(100dvh - 112px)",
      }}
    >
      {isViewer && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have read-only access to employees. Only the company owner can add,
          edit or manage employee login.
        </Alert>
      )}

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
          You don't have an active company yet. Create your company before adding
          or importing employees.
        </Alert>
      )}

      <EmployeeFilters
        search={searchInput}
        departmentId={departmentId}
        status={status}
        departments={departments}
        departmentsLoading={departmentsLoading}
        onSearchChange={setSearchInput}
        onDepartmentChange={setDepartmentId}
        onStatusChange={setStatus}
        actions={
          canWrite ? (
            <>
              <Button
                variant="outlined"
                startIcon={<MdManageAccounts size={18} />}
                onClick={(e) => setLoginMenuAnchor(e.currentTarget)}
                sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
              >
                Login access
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={isProofOpen}
                    onChange={handleToggleProof}
                    disabled={toggleProofWindow.isPending || proofLoading}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    Proof Upload: {isProofOpen ? "Open" : "Closed"}
                  </Typography>
                }
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.5,
                  mr: 0,
                  ml: 0,
                  height: 36.5,
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "action.hover",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              />
              <Button
                variant="outlined"
                startIcon={<MdUploadFile size={18} />}
                onClick={() => setBulkOpen(true)}
                sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
              >
                Bulk Upload
              </Button>
              <Button
                variant="contained"
                startIcon={<MdAdd size={18} />}
                onClick={openCreate}
                sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
              >
                Add Employee
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Employees table — grows to fill the remaining height so the
          pagination footer is pinned to the bottom of the page. */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <DataTable
          columns={columns}
          data={employees}
          loading={isLoading}
          error={isError ? "Failed to load employees." : null}
          onRetry={() => refetch()}
          fillHeight
          emptyTitle="No employees found"
          emptyDescription={
            hasFilters
              ? "Try adjusting your search or filters."
              : canWrite
                ? "Add your first employee or import a spreadsheet."
                : undefined
          }
          emptyAction={
            canWrite && !hasFilters ? (
              <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={openCreate}>
                Add Employee
              </Button>
            ) : undefined
          }
          ariaLabel="Employees"
          onRowClick={(employee) => setDetailEmployee(employee)}
          rowActions={(employee) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="View profile">
                <IconButton
                  size="small"
                  aria-label="View employee profile"
                  component={RouterLink}
                  to={`/dashboard/employees/${employee.id}`}
                  onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
                >
                  <MdVisibility size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Quick view">
                <IconButton
                  size="small"
                  aria-label="Quick view employee"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailEmployee(employee);
                  }}
                >
                  <MdEdit size={18} />
                </IconButton>
              </Tooltip>
              {canManage && (
                <Tooltip title="More actions">
                  <IconButton
                    size="small"
                    aria-label="Employee actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMenu(e, employee);
                    }}
                  >
                    <MdMoreVert size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        />
      </Box>

      {/* Detail drawer (all roles) */}
      <EmployeeDetailDrawer
        open={!!detailEmployee}
        employee={detailEmployee}
        onClose={() => setDetailEmployee(null)}
      />

      {/* Owner-only mutating UI */}
      {canManage && (
        <>
          {/* Bulk login-access menu (header action) */}
          <Menu
            anchorEl={loginMenuAnchor}
            open={!!loginMenuAnchor}
            onClose={() => setLoginMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setBulkLoginConfirm("enable");
                setLoginMenuAnchor(null);
              }}
            >
              <MdLogin size={18} style={{ marginRight: 10 }} />
              Enable login for all
            </MenuItem>
            <MenuItem
              onClick={() => {
                setBulkLoginConfirm("disable");
                setLoginMenuAnchor(null);
              }}
            >
              <MdLogout size={18} style={{ marginRight: 10 }} />
              Disable login for all
            </MenuItem>
          </Menu>

          {/* Per-row action menu */}
          <Menu anchorEl={menu?.anchorEl} open={!!menu} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                if (menu) openEdit(menu.employee);
                closeMenu();
              }}
            >
              <MdEdit size={18} style={{ marginRight: 10 }} />
              Edit
            </MenuItem>
            {menu && !menu.employee.userId && (
              <MenuItem
                onClick={() => {
                  setEnableLoginTarget(menu.employee);
                  closeMenu();
                }}
              >
                <MdLogin size={18} style={{ marginRight: 10 }} />
                Enable login
              </MenuItem>
            )}
            {menu && !!menu.employee.userId && (
              <MenuItem
                onClick={() => {
                  setDisableLoginTarget(menu.employee);
                  closeMenu();
                }}
              >
                <MdLogout size={18} style={{ marginRight: 10 }} />
                Disable login
              </MenuItem>
            )}
            <Divider />
            <ListSubheader sx={{ bgcolor: "transparent", lineHeight: 2 }}>
              Set status
            </ListSubheader>
            {EMPLOYEE_STATUS_OPTIONS.filter(
              (option) => option.value !== menu?.employee.status
            ).map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  if (menu) setStatusTarget({ employee: menu.employee, status: option.value });
                  closeMenu();
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {formMode === "create" ? "Add Employee" : "Edit Employee"}
            </DialogTitle>
            <DialogContent>
              <EmployeeForm
                mode={formMode}
                initialValues={formInitialValues}
                departments={departments}
                departmentsLoading={departmentsLoading}
                onSubmit={handleSubmit}
                loading={submitting}
                onCancel={closeForm}
              />
            </DialogContent>
          </Dialog>

          <BulkUploadDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />

          <ConfirmDialog
            open={!!statusTarget}
            title="Update employee status"
            severity="primary"
            confirmLabel="Update status"
            loading={statusMutation.isPending}
            message={
              statusTarget ? (
                <>
                  Set <strong>{statusTarget.employee.name}</strong> to{" "}
                  <strong>{statusTarget.status}</strong>?
                </>
              ) : undefined
            }
            onConfirm={handleStatusConfirm}
            onClose={() => {
              if (!statusMutation.isPending) setStatusTarget(null);
            }}
          />

          <ConfirmDialog
            open={!!enableLoginTarget}
            title="Enable login"
            severity="primary"
            confirmLabel="Enable login"
            loading={enableLoginMutation.isPending}
            message={
              enableLoginTarget ? (
                <>
                  Enable self-service login for{" "}
                  <strong>{enableLoginTarget.name}</strong>? They'll be emailed
                  and can sign in with a one-time code.
                </>
              ) : undefined
            }
            onConfirm={handleEnableLoginConfirm}
            onClose={() => {
              if (!enableLoginMutation.isPending) setEnableLoginTarget(null);
            }}
          />

          <ConfirmDialog
            open={!!disableLoginTarget}
            title="Disable login"
            severity="error"
            confirmLabel="Disable login"
            loading={disableLoginMutation.isPending}
            message={
              disableLoginTarget ? (
                <>
                  Disable self-service login for{" "}
                  <strong>{disableLoginTarget.name}</strong>? Their active
                  sessions are revoked. The employee record is kept and login can
                  be re-enabled later.
                </>
              ) : undefined
            }
            onConfirm={handleDisableLoginConfirm}
            onClose={() => {
              if (!disableLoginMutation.isPending) setDisableLoginTarget(null);
            }}
          />

          <ConfirmDialog
            open={!!bulkLoginConfirm}
            title={
              bulkLoginConfirm === "disable"
                ? "Disable login for all"
                : "Enable login for all"
            }
            severity={bulkLoginConfirm === "disable" ? "error" : "primary"}
            confirmLabel={
              bulkLoginConfirm === "disable" ? "Disable for all" : "Enable for all"
            }
            loading={bulkLoginPending}
            message={
              bulkLoginConfirm === "disable" ? (
                <>
                  Disable login for <strong>every employee</strong> that currently
                  has one? Their sessions will be revoked.
                </>
              ) : (
                <>
                  Enable login for <strong>every eligible employee</strong>?
                  Employees with no email or an existing login are skipped.
                </>
              )
            }
            onConfirm={handleBulkLoginConfirm}
            onClose={() => {
              if (!bulkLoginPending) setBulkLoginConfirm(null);
            }}
          />

          {/* Bulk login result summary */}
          <BulkLoginResultDialog
            result={bulkLoginResult}
            onClose={() => setBulkLoginResult(null)}
          />
        </>
      )}
    </Box>
  );
}

// Read-only summary of a "for all" login action: counts + the skipped list with
// reasons so the owner can see who was left out and why.
function BulkLoginResultDialog({
  result,
  onClose,
}: {
  result: BulkLoginResult | null;
  onClose: () => void;
}) {
  const isEnable = result?.kind === "enable";
  const affectedCount = result
    ? isEnable
      ? result.data.enabledCount
      : result.data.disabledCount
    : 0;
  const skipped = result?.data.skipped ?? [];

  return (
    <Dialog open={!!result} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEnable ? "Login enabled" : "Login disabled"}
      </DialogTitle>
      <DialogContent>
        {result && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {isEnable ? "Enabled" : "Disabled"} login for{" "}
              <strong>{affectedCount}</strong> of{" "}
              <strong>{result.data.totalEmployees}</strong> employee(s).
            </Typography>
            {skipped.length > 0 ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                  Skipped ({skipped.length})
                </Typography>
                <List dense sx={{ maxHeight: 240, overflowY: "auto" }}>
                  {skipped.map((item) => (
                    <ListItem key={item.employeeId} disableGutters sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={item.name || item.email || item.employeeId}
                        secondary={item.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No employees were skipped.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
