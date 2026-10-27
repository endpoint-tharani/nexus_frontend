import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

import { createBranch, deleteBranch, updateBranch } from "../../api/branch.api";
import { ConfirmDialog, DataTable, PageHeader } from "../../components/ui";
import { useBranches } from "../../hooks/branch";
import { useCurrentRole } from "../../hooks/user";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { queryKeys } from "../../constants/queryKeys";
import { CompanyRole } from "../../constants/enums";
import type { Branch, BranchPayload } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

const emptyForm: BranchPayload = { name: "", code: "" };

export default function Branches() {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();
  const role = useCurrentRole();
  const canManage = role === CompanyRole.OWNER || role === CompanyRole.ADMIN;
  const { data: branches = [], isLoading, isError, refetch } = useBranches();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchPayload>(emptyForm);
  const [formError, setFormError] = useState("");

  const refresh = () => {
    if (!companyId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.branches.all(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all(companyId) });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: BranchPayload) => {
      if (!companyId) throw new Error("No organization is selected.");
      return editing
        ? updateBranch(editing.id, companyId, values)
        : createBranch(companyId, values);
    },
    onSuccess: () => {
      refresh();
      toast.success(editing ? "Branch updated" : "Branch created");
      setDialogOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (branch: Branch) => {
      if (!companyId) throw new Error("No organization is selected.");
      return deleteBranch(branch.id, companyId);
    },
    onSuccess: () => {
      refresh();
      toast.success("Branch deleted");
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      addressLine: branch.addressLine ?? "",
      city: branch.city ?? "",
      state: branch.state ?? "",
      country: branch.country ?? "",
      pinCode: branch.pinCode ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const submit = () => {
    const values = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
    };
    if (!values.name || !values.code) {
      setFormError("Branch name and code are required.");
      return;
    }
    saveMutation.mutate(values);
  };

  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Branch",
        cell: ({ row }) => <Typography sx={{ fontWeight: 600 }}>{row.original.name}</Typography>,
      },
      { accessorKey: "code", header: "Code" },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) =>
          [row.original.city, row.original.state].filter(Boolean).join(", ") || "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
      },
    ],
    [],
  );

  return (
    <Box>
      <PageHeader
        title="Branches"
        subtitle="Manage the locations that belong to your organization."
        actions={
          canManage ? (
            <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={openCreate}>
              Add branch
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={branches}
        loading={isLoading}
        error={isError ? "Unable to load branches." : null}
        onRetry={() => refetch()}
        emptyTitle="No branches yet"
        emptyDescription={canManage ? "Create a branch to start organizing departments." : "No branches are assigned to your account."}
        ariaLabel="Organization branches"
        rowActions={
          canManage
            ? (branch) => (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Tooltip title="Edit branch">
                    <IconButton size="small" aria-label="Edit branch" onClick={() => openEdit(branch)}>
                      <MdEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete branch">
                    <IconButton size="small" color="error" aria-label="Delete branch" onClick={() => setDeleteTarget(branch)}>
                      <MdDelete size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            : undefined
        }
      />

      <Dialog open={dialogOpen} onClose={() => !saveMutation.isPending && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit branch" : "Add branch"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Branch name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              required
              label="Branch code"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            />
            <TextField
              label="Address"
              value={form.addressLine ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="City" value={form.city ?? ""} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} fullWidth />
              <TextField label="State" value={form.state ?? ""} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Country" value={form.country ?? ""} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} fullWidth />
              <TextField label="Postal code" value={form.pinCode ?? ""} onChange={(event) => setForm((current) => ({ ...current, pinCode: event.target.value }))} fullWidth />
            </Stack>
            {formError && <Typography color="error" variant="body2">{formError}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saveMutation.isPending}>Cancel</Button>
          <Button onClick={submit} variant="contained" disabled={saveMutation.isPending}>
            {editing ? "Save changes" : "Create branch"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete branch"
        message={<>Delete <strong>{deleteTarget?.name}</strong>? Departments under this branch may also be affected.</>}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
      />
    </Box>
  );
}
