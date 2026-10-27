import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

import { PageHeader, SectionCard } from "../../components/ui";
import { useCompany, useUpdateCompany } from "../../hooks/company";
import { useCompanyStore } from "../../store/company.store";
import { useCurrentRole } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import type { UpdateCompanyPayload } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

type FormValues = Required<Pick<UpdateCompanyPayload, "name">> &
  Pick<UpdateCompanyPayload, "email" | "phone" | "address">;

const emptyForm: FormValues = { name: "", email: "", phone: "", address: "" };

export default function Organization() {
  const { data: organization, isLoading, isError, refetch } = useCompany();
  const updateMutation = useUpdateCompany();
  const setCompany = useCompanyStore((state) => state.setCompany);
  const role = useCurrentRole();
  const canManage = role === CompanyRole.OWNER || role === CompanyRole.ADMIN;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);

  const save = () => {
    const payload: UpdateCompanyPayload = {
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      address: form.address?.trim() || undefined,
    };
    updateMutation.mutate(payload, {
      onSuccess: (updated) => {
        setCompany(updated);
        setOpen(false);
        toast.success("Organization updated");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={220} />;
  }

  if (isError || !organization) {
    return <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>Unable to load organization details.</Alert>;
  }

  return (
    <Box>
      <PageHeader
        title="Organization"
        subtitle="Manage your organization profile and its hierarchy."
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<MdEdit size={18} />}
              onClick={() => {
                setForm({
                  name: organization.name,
                  email: organization.email ?? "",
                  phone: organization.phone ?? "",
                  address: organization.address ?? "",
                });
                setOpen(true);
              }}
            >
              Edit organization
            </Button>
          ) : undefined
        }
      />
      <SectionCard title={organization.name}>
        <Grid container spacing={2}>
          {[
            ["Email", organization.email],
            ["Phone", organization.phone],
            ["Address", organization.address],
          ].map(([label, value]) => (
            <Grid key={label} size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body1">{value || "Not provided"}</Typography>
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      <Dialog open={open} onClose={() => !updateMutation.isPending && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit organization</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              label="Organization name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              type="email"
              label="Email"
              value={form.email ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <TextField
              label="Phone"
              value={form.phone ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <TextField
              label="Address"
              multiline
              minRows={2}
              value={form.address ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
          <Button onClick={save} variant="contained" disabled={updateMutation.isPending || !form.name.trim()}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
