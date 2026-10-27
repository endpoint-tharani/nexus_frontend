import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdFileDownload,
  MdMoreVert,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import { PageHeader, DataTable, ConfirmDialog } from "../../components/ui";
import HolidayForm from "../../components/holiday/HolidayForm";
import HolidayFilters from "../../components/holiday/HolidayFilters";
import HolidayCalendar from "../../components/holiday/HolidayCalendar";
import {
  useHolidays,
  useHolidayCalendar,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from "../../hooks/holiday";
import { useBranches } from "../../hooks/branch";
import { useCurrentRole } from "../../hooks/user/useCurrentRole";
import {
  CompanyRole,
  HOLIDAY_SCOPE_LABELS,
  HOLIDAY_TYPE_COLORS,
  HOLIDAY_TYPE_LABELS,
} from "../../constants/enums";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../constants/app";
import type { HolidayType } from "../../constants/enums";
import type {
  CreateHolidayPayload,
  Holiday,
  UpdateHolidayPayload,
} from "../../types";
import type { HolidayFormData } from "../../schemas/holiday.schema";
import { downloadCsv, getErrorMessage } from "../../utils";

const { OWNER, ADMIN, HR } = CompanyRole;
const MANAGER_ROLES: string[] = [OWNER, ADMIN, HR];

type TabKey = "calendar" | "list";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const holidayToFormValues = (holiday: Holiday): HolidayFormData => ({
  name: holiday.name,
  date: holiday.date.slice(0, 10),
  type: holiday.type,
  scope: holiday.scope,
  branchId: holiday.branchId ?? "",
  isOptional: holiday.isOptional,
  region: holiday.region ?? "",
  isActive: holiday.isActive,
});

export default function Holidays() {
  const role = useCurrentRole();
  const canManage = !!role && MANAGER_ROLES.includes(role);

  const [tab, setTab] = useState<TabKey>("calendar");

  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const branchName = useMemo(() => {
    const map = new Map(branches.map((b) => [b.id, b.name]));
    return (id?: string | null) => (id ? map.get(id) ?? "—" : "Company-wide");
  }, [branches]);

  // --- calendar tab state ---
  const [calendarYear, setCalendarYear] = useState(currentYear);
  const [calendarBranchId, setCalendarBranchId] = useState("");
  const calendarQuery = useHolidayCalendar(
    calendarYear,
    calendarBranchId || undefined,
    { enabled: tab === "calendar" }
  );

  // --- list tab filters + pagination ---
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<HolidayType | "">("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | "">("");
  const [branchId, setBranchId] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, type, year, month, branchId, includeInactive, pageSize]);

  const listQuery = useHolidays(
    {
      page,
      pageSize,
      search: search || undefined,
      type: type || undefined,
      year,
      month: month || undefined,
      branchId: branchId || undefined,
      includeInactive,
    },
    { enabled: tab === "list" }
  );
  const holidays = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;

  // --- mutations ---
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();
  const deleteMutation = useDeleteHoliday();

  // --- dialogs ---
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [deleting, setDeleting] = useState<Holiday | null>(null);

  // --- row action menu ---
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuHoliday, setMenuHoliday] = useState<Holiday | null>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>, holiday: Holiday) => {
    setMenuAnchor(e.currentTarget);
    setMenuHoliday(holiday);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuHoliday(null);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (holiday: Holiday) => {
    setFormMode("edit");
    setEditing(holiday);
    setFormOpen(true);
    closeMenu();
  };

  const handleSubmit = (values: HolidayFormData) => {
    const payload: CreateHolidayPayload = {
      name: values.name,
      date: values.date,
      type: values.type,
      scope: values.scope,
      branchId: values.branchId || undefined,
      isOptional: values.isOptional ?? false,
      region: values.region || undefined,
    };
    if (formMode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Holiday created");
          setFormOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      });
    } else if (editing) {
      const updatePayload: UpdateHolidayPayload = {
        ...payload,
        branchId: values.branchId || null,
        region: values.region || null,
        isActive: values.isActive ?? true,
      };
      updateMutation.mutate(
        { id: editing.id, data: updatePayload },
        {
          onSuccess: () => {
            toast.success("Holiday updated");
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
        toast.success("Holiday deleted");
        setDeleting(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const exportHolidaysCsv = () => {
    downloadCsv(
      `holidays-${year}`,
      ["Date", "Name", "Type", "Scope", "Branch", "Optional", "Status"],
      holidays.map((h) => [
        h.date.slice(0, 10),
        h.name,
        HOLIDAY_TYPE_LABELS[h.type],
        HOLIDAY_SCOPE_LABELS[h.scope],
        branchName(h.branchId),
        h.isOptional ? "Yes" : "No",
        h.isActive ? "Active" : "Inactive",
      ])
    );
  };

  const columns = useMemo<ColumnDef<Holiday>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => row.original.date.slice(0, 10),
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Chip
            size="small"
            label={HOLIDAY_TYPE_LABELS[row.original.type]}
            color={HOLIDAY_TYPE_COLORS[row.original.type]}
            variant="outlined"
          />
        ),
      },
      {
        id: "scope",
        header: "Scope",
        cell: ({ row }) => HOLIDAY_SCOPE_LABELS[row.original.scope],
      },
      {
        id: "branch",
        header: "Branch",
        cell: ({ row }) => branchName(row.original.branchId),
      },
      {
        id: "optional",
        header: "Optional",
        cell: ({ row }) =>
          row.original.isOptional ? (
            <Chip size="small" label="Optional" color="warning" variant="outlined" />
          ) : (
            "—"
          ),
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
        title="Holidays"
        subtitle="Maintain the company and branch holiday calendar."
        actions={
          canManage ? (
            <Button variant="contained" startIcon={<MdAdd />} onClick={openCreate}>
              Create holiday
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setTab(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="calendar" label="Calendar" />
        <Tab value="list" label="List" />
      </Tabs>

      {tab === "calendar" && (
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2,
              alignItems: { sm: "center" },
            }}
          >
            <TextField
              select
              label="Year"
              size="small"
              value={calendarYear}
              onChange={(e) => setCalendarYear(Number(e.target.value))}
              sx={{ width: { xs: "100%", sm: 120 } }}
            >
              {YEAR_OPTIONS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Branch"
              size="small"
              value={calendarBranchId}
              onChange={(e) => setCalendarBranchId(e.target.value)}
              disabled={branchesLoading}
              sx={{ width: { xs: "100%", sm: 200 } }}
            >
              <MenuItem value="">All branches</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <HolidayCalendar
            data={calendarQuery.data}
            loading={calendarQuery.isLoading}
            onHolidayClick={canManage ? openEdit : undefined}
          />
        </Box>
      )}

      {tab === "list" && (
        <Box>
          <HolidayFilters
            search={searchInput}
            type={type}
            year={year}
            month={month}
            branchId={branchId}
            includeInactive={includeInactive}
            years={YEAR_OPTIONS}
            branches={branches}
            branchesLoading={branchesLoading}
            onSearchChange={setSearchInput}
            onTypeChange={setType}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onBranchChange={setBranchId}
            onIncludeInactiveChange={setIncludeInactive}
            actions={
              <Button
                variant="outlined"
                startIcon={<MdFileDownload />}
                onClick={exportHolidaysCsv}
                disabled={holidays.length === 0}
              >
                Export CSV
              </Button>
            }
          />

          <DataTable
            columns={columns}
            data={holidays}
            loading={listQuery.isLoading}
            error={listQuery.isError ? "Failed to load holidays." : null}
            onRetry={() => listQuery.refetch()}
            enablePagination={false}
            emptyTitle="No holidays found"
            emptyDescription="Create a holiday or adjust the filters."
            rowActions={
              canManage
                ? (holiday) => (
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => openMenu(e, holiday)}>
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

      {/* Row action menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => menuHoliday && openEdit(menuHoliday)}>
          <MdEdit style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleting(menuHoliday);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <MdDelete style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formMode === "create" ? "Create holiday" : "Edit holiday"}</DialogTitle>
        <DialogContent dividers>
          <HolidayForm
            mode={formMode}
            initialValues={editing ? holidayToFormValues(editing) : undefined}
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
        title="Delete holiday"
        message={
          deleting ? `Delete "${deleting.name}" on ${deleting.date.slice(0, 10)}?` : ""
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}
