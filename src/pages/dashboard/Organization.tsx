import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdBusiness, MdEdit, MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
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
      <SectionCard
        title="Organization profile"
        subtitle="The core contact details associated with your organization."
        sx={{ borderRadius: 3 }}
        contentSx={{ pt: 0 }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 2.5,
            borderRadius: 2.5,
            background: (theme) =>
              `linear-gradient(120deg, ${theme.palette.primary.main}12, ${theme.palette.background.paper} 72%)`,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <MdBusiness size={26} />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                ORGANIZATION
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, overflowWrap: "anywhere", lineHeight: 1.35 }}
              >
                {organization.name}
              </Typography>
            </Box>
            <Chip
              size="small"
              label="Organization profile"
              color="primary"
              variant="outlined"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            />
          </Box>
        </Paper>
        <Grid container spacing={1.5}>
          {[
            { label: "Email address", value: organization.email, icon: <MdEmail size={19} /> },
            { label: "Phone number", value: organization.phone, icon: <MdPhone size={19} /> },
            { label: "Address", value: organization.address, icon: <MdLocationOn size={19} /> },
          ].map(({ label, value, icon }) => (
            <Grid key={label} size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  minHeight: 112,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", color: "primary.main" }}>{icon}</Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 550, overflowWrap: "anywhere", lineHeight: 1.6 }}
                >
                  {value || "Not provided"}
                </Typography>
              </Paper>
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
