import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
import { MdEdit, MdHistory, MdSchool } from "react-icons/md";
import toast from "react-hot-toast";
import { DataTable, InfoRow, PageHeader, SectionCard, StatusBadge } from "../../components/ui";
import { getMyStudentActivities, getMyStudentDepartments, getMyStudentProfile, updateMyStudentProfile } from "../../api/student.api";
import type { StudentActivity } from "../../api/student.api";
import { getErrorMessage } from "../../utils/errorHandler";

const studentKeys = {
  profile: ["student", "me"] as const,
  departments: ["student", "me", "departments"] as const,
  activities: ["student", "me", "activities"] as const,
};

export default function Student() {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", address: "", guardianName: "", guardianPhone: "", guardianEmail: "", emergencyContact: "" });
  const profileQuery = useQuery({ queryKey: studentKeys.profile, queryFn: async () => (await getMyStudentProfile()).data.data });
  const departmentsQuery = useQuery({ queryKey: studentKeys.departments, queryFn: async () => (await getMyStudentDepartments()).data.data ?? [] });
  const activitiesQuery = useQuery({ queryKey: studentKeys.activities, queryFn: async () => (await getMyStudentActivities()).data.data.items });
  const updateMutation = useMutation({
    mutationFn: () => updateMyStudentProfile({
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      guardianName: form.guardianName.trim() || null,
      guardianPhone: form.guardianPhone.trim() || null,
      guardianEmail: form.guardianEmail.trim() || null,
      emergencyContact: form.emergencyContact.trim() || null,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.profile });
      await queryClient.invalidateQueries({ queryKey: studentKeys.activities });
      toast.success("Profile updated");
      setEditOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const profile = profileQuery.data;
  const openEdit = () => {
    setForm({
      phone: profile?.phone ?? "", address: profile?.address ?? "", guardianName: profile?.guardianName ?? "",
      guardianPhone: profile?.guardianPhone ?? "", guardianEmail: profile?.guardianEmail ?? "", emergencyContact: profile?.emergencyContact ?? "",
    });
    setEditOpen(true);
  };
  const activityColumns = useMemo<ColumnDef<StudentActivity>[]>(() => [
    { accessorKey: "type", header: "Activity", cell: ({ getValue }) => String(getValue() ?? "Activity").replaceAll("_", " ") },
    { accessorKey: "description", header: "Details", cell: ({ getValue }) => getValue<string>() || "—" },
    { accessorKey: "occurredAt", header: "Date", cell: ({ getValue }) => {
      const date = getValue<string>();
      return date ? new Date(date).toLocaleString() : "—";
    } },
  ], []);

  return <Box>
    <PageHeader title="Student" subtitle="Your profile, enrolled departments, and recent activity." actions={<Button variant="outlined" startIcon={<MdEdit />} onClick={openEdit} disabled={!profile}>Edit profile</Button>} />
    {(profileQuery.isError || departmentsQuery.isError) && <Alert severity="error" sx={{ mb: 2 }}>Some student information could not be loaded. Refresh the affected section to try again.</Alert>}
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <SectionCard title="My profile" subtitle={profile?.user?.name ?? "Student details"}>
          {profileQuery.isLoading ? <Typography color="text.secondary">Loading profile…</Typography> : profile ? <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 3 }}>
              <InfoRow label="Email" value={profile.user?.email} />
              <InfoRow label="Admission number" value={profile.admissionNumber} />
              <InfoRow label="Phone" value={profile.phone} />
              <InfoRow label="Status" value={<StatusBadge label={(profile.status ?? "UNKNOWN").replaceAll("_", " ")} type={profile.status === "ACTIVE" ? "success" : "warning"} />} />
              <InfoRow label="Address" value={profile.address} span />
              <InfoRow label="Guardian" value={profile.guardianName} />
              <InfoRow label="Guardian phone" value={profile.guardianPhone} />
            </Box>
          </> : <Alert severity="info">Student profile is unavailable.</Alert>}
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <SectionCard title="My departments" subtitle="Your current and previous department memberships.">
          {departmentsQuery.isLoading ? <Typography color="text.secondary">Loading departments…</Typography> : departmentsQuery.data?.length ? <Stack spacing={1.25}>
            {departmentsQuery.data.map((membership, index) => <Box key={membership?.id ?? `${membership?.department?.id ?? "department"}-${index}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MdSchool /><Typography>{membership?.department?.name ?? "Department"}</Typography></Box>
              <StatusBadge label={(membership?.status ?? "ACTIVE").replaceAll("_", " ")} type={membership?.status === "ENDED" ? "default" : "success"} />
            </Box>)}
          </Stack> : <Typography color="text.secondary">No department memberships found.</Typography>}
        </SectionCard>
      </Grid>
    </Grid>
    {activitiesQuery.isError && <Alert severity="error" sx={{ mb: 2 }}>Could not load your recent activity.</Alert>}
    <SectionCard title="Recent activity" subtitle="Updates and events related to your student account." actions={<MdHistory size={20} />} disableContentPadding>
      <DataTable columns={activityColumns} data={activitiesQuery.data ?? []} loading={activitiesQuery.isLoading} error={activitiesQuery.isError ? "Unable to load activity" : null} onRetry={() => void activitiesQuery.refetch()} emptyTitle="No activity yet" emptyDescription="Your account activity will show here." />
    </SectionCard>
    <Dialog open={editOpen} onClose={() => !updateMutation.isPending && setEditOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Edit student profile</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <TextField label="Address" multiline minRows={2} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        <TextField label="Guardian name" value={form.guardianName} onChange={(event) => setForm({ ...form, guardianName: event.target.value })} />
        <TextField label="Guardian phone" value={form.guardianPhone} onChange={(event) => setForm({ ...form, guardianPhone: event.target.value })} />
        <TextField label="Guardian email" type="email" value={form.guardianEmail} onChange={(event) => setForm({ ...form, guardianEmail: event.target.value })} />
        <TextField label="Emergency contact" value={form.emergencyContact} onChange={(event) => setForm({ ...form, emergencyContact: event.target.value })} />
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>Cancel</Button><Button variant="contained" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>Save changes</Button></DialogActions>
    </Dialog>
  </Box>;
}
