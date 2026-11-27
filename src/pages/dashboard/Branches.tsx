import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MdAdd, MdDelete, MdEdit, MdLocationCity, MdSearch } from "react-icons/md";
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
import { useBranchStore } from "../../store/branch.store";

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
  const [search, setSearch] = useState("");
  const createRequested = useBranchStore((state) => state.createRequested);
  const clearBranchCreateRequest = useBranchStore((state) => state.clearBranchCreateRequest);
  const activeForm = createRequested ? emptyForm : form;
  const activeEditing = createRequested ? null : editing;
  const filteredBranches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return branches;
    return branches.filter((branch) =>
      [branch.name, branch.code, branch.city, branch.state]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [branches, search]);

  const updateForm = (update: (current: BranchPayload) => BranchPayload) => {
    if (createRequested) {
      setForm(update(emptyForm));
      setEditing(null);
      setDialogOpen(true);
      clearBranchCreateRequest();
      return;
    }
    setForm(update);
  };

  const refresh = () => {
    if (!companyId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.branches.all(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all(companyId) });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: BranchPayload) => {
      if (!companyId) throw new Error("No organization is selected.");
      return activeEditing
        ? updateBranch(activeEditing.id, companyId, values)
        : createBranch(companyId, values);
    },
    onSuccess: () => {
      refresh();
      toast.success(activeEditing ? "Branch updated" : "Branch created");
      setDialogOpen(false);
      clearBranchCreateRequest();
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
    clearBranchCreateRequest();
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    clearBranchCreateRequest();
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
    if (createRequested) {
      setForm(emptyForm);
      setEditing(null);
      setDialogOpen(true);
      clearBranchCreateRequest();
    }
    const values = {
      ...activeForm,
      name: activeForm.name.trim(),
      code: activeForm.code.trim(),
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
        cell: ({ row }) => (
          <Chip
            size="small"
            label={row.original.isActive ? "Active" : "Inactive"}
            color={row.original.isActive ? "success" : "default"}
            variant="outlined"
          />
        ),
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
      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 2.5,
          bgcolor: "background.paper",
        }}
      >
        <TextField
          placeholder="Search branches..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 340 } }}
          slotProps={{
            htmlInput: { "aria-label": "Search branches" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <MdLocationCity size={19} color="currentColor" />
          <Typography variant="body2" color="text.secondary">
            <strong>{filteredBranches.length}</strong>{" "}
            {filteredBranches.length === 1 ? "branch" : "branches"}
          </Typography>
        </Box>
      </Paper>
      <DataTable
        columns={columns}
        data={filteredBranches}
        loading={isLoading}
        error={isError ? "Unable to load branches." : null}
        onRetry={() => refetch()}
        emptyTitle={search ? "No matching branches" : "No branches yet"}
        emptyDescription={search ? "Try a different name, code, or location." : canManage ? "Create a branch to start organizing departments." : "No branches are assigned to your account."}
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

      <Dialog
        open={dialogOpen || createRequested}
        onClose={() => {
          if (saveMutation.isPending) return;
          setDialogOpen(false);
          clearBranchCreateRequest();
        }}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        slotProps={{ paper: { sx: { mx: { xs: 1.5, sm: 2 }, width: "100%" } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>{activeEditing ? "Edit branch" : "Add branch"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Branch name"
              value={activeForm.name}
              onChange={(event) => updateForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              required
              label="Branch code"
              value={activeForm.code}
              onChange={(event) => updateForm((current) => ({ ...current, code: event.target.value }))}
            />
            <Typography variant="overline" color="text.secondary" sx={{ pt: 0.5 }}>
              Location
            </Typography>
            <TextField
              label="Address"
              value={activeForm.addressLine ?? ""}
              onChange={(event) => updateForm((current) => ({ ...current, addressLine: event.target.value }))}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="City" value={activeForm.city ?? ""} onChange={(event) => updateForm((current) => ({ ...current, city: event.target.value }))} fullWidth />
              <TextField label="State" value={activeForm.state ?? ""} onChange={(event) => updateForm((current) => ({ ...current, state: event.target.value }))} fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Country" value={activeForm.country ?? ""} onChange={(event) => updateForm((current) => ({ ...current, country: event.target.value }))} fullWidth />
              <TextField label="Postal code" value={activeForm.pinCode ?? ""} onChange={(event) => updateForm((current) => ({ ...current, pinCode: event.target.value }))} fullWidth />
            </Stack>
            {!createRequested && formError && <Typography color="error" variant="body2">{formError}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              clearBranchCreateRequest();
            }}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} variant="contained" disabled={saveMutation.isPending}>
            {activeEditing ? "Save changes" : "Create branch"}
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
