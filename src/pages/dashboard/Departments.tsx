import { useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import { ConfirmDialog, DataTable, DateText, PageHeader } from "../../components/ui";
import { DepartmentFormDialog } from "../../components/department";
import {
  useCreateDepartment,
  useDepartments,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../hooks/department";
import { useBranches } from "../../hooks/branch";
import { useCurrentRole, useMe } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import type { CreateDepartmentPayload, Department } from "../../types";
import type { DepartmentFormData } from "../../schemas/department.schema";
import { getErrorMessage } from "../../utils/errorHandler";

type FormMode = "create" | "edit";

export default function Departments() {
  const { data: me } = useMe();
  const role = useCurrentRole();
  const { data: branches = [] } = useBranches();
  const [branchSelection, setBranchSelection] = useState("");
  const selectedBranchId =
    me?.branchId ??
    (branches.some((branch) => branch.id === branchSelection)
      ? branchSelection
      : branches[0]?.id ?? "");

  const {
    data: departments = [],
    isLoading,
    isError,
    refetch,
  } = useDepartments({
    branchId: selectedBranchId || undefined,
    departmentId: me?.departmentId ?? undefined,
    enabled: Boolean(selectedBranchId),
  });
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const canCreate = role === CompanyRole.OWNER || role === CompanyRole.ADMIN || role === CompanyRole.BRANCH_ADMIN;
  const canManageDepartment = (department: Department) =>
    canCreate ||
    (role === CompanyRole.DEPARTMENT_ADMIN && department.id === me?.departmentId);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const submitting = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return departments;
    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(term) ||
        (department.description?.toLowerCase().includes(term) ?? false),
    );
  }, [departments, search]);

  const formInitialValues = useMemo<DepartmentFormData>(
    () => ({ name: editing?.name ?? "", description: editing?.description ?? "" }),
    [editing],
  );

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (department: Department) => {
    setFormMode("edit");
    setEditing(department);
    setFormOpen(true);
  };

  const handleSubmit = (values: DepartmentFormData) => {
    const payload: CreateDepartmentPayload = {
      branchId: editing?.branchId ?? selectedBranchId,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
    };
    if (!payload.branchId) {
      toast.error("Choose a branch before creating a department.");
      return;
    }

    if (formMode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Department created");
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
          toast.success("Department updated");
          setFormOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id, branchId: deleteTarget.branchId },
      {
        onSuccess: () => {
          toast.success("Department deleted");
          setDeleteTarget(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Department",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        id: "branch",
        header: "Branch",
        cell: ({ row }) =>
          branches.find((branch) => branch.id === row.original.branchId)?.name ?? "—",
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => row.original.description || "—",
      },
      {
        id: "createdAt",
        header: "Created",
        cell: ({ row }) => <DateText value={row.original.createdAt} />,
      },
    ],
    [branches],
  );

  return (
    <Box>
      <PageHeader
        title="Departments"
        subtitle="Each department belongs to a branch in your organization."
        actions={
          canCreate ? (
            <Button
              variant="contained"
              startIcon={<MdAdd size={18} />}
              onClick={openCreate}
              disabled={!selectedBranchId}
            >
              Add department
            </Button>
          ) : undefined
        }
      />

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="department-branch-label">Branch</InputLabel>
          <Select
            labelId="department-branch-label"
            label="Branch"
            value={selectedBranchId}
            onChange={(event) => setBranchSelection(event.target.value)}
            disabled={Boolean(me?.branchId)}
          >
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          placeholder="Search departments..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><MdSearch size={18} /></InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        error={isError ? "Failed to load departments." : null}
        onRetry={() => refetch()}
        emptyTitle={selectedBranchId ? "No departments in this branch" : "No branches available"}
        emptyDescription={
          canCreate && selectedBranchId
            ? "Create the first department for this branch."
            : "Departments are organized under a branch."
        }
        emptyAction={
          canCreate && selectedBranchId ? (
            <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={openCreate}>
              Add department
            </Button>
          ) : undefined
        }
        ariaLabel="Departments"
        rowActions={(department) =>
          canManageDepartment(department) ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="Edit">
                <IconButton size="small" aria-label="Edit department" onClick={() => openEdit(department)}>
                  <MdEdit size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete department"
                  onClick={() => setDeleteTarget(department)}
                >
                  <MdDelete size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : undefined
        }
      />

      <DepartmentFormDialog
        open={formOpen}
        mode={formMode}
        initialValues={formInitialValues}
        loading={submitting}
        onSubmit={handleSubmit}
        onClose={() => !submitting && setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete department"
        message={<>Delete <strong>{deleteTarget?.name}</strong> from {branches.find((branch) => branch.id === deleteTarget?.branchId)?.name ?? "this branch"}?</>}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
      />
    </Box>
  );
}
