import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { MdHistory, MdSearch, MdSchool, MdVisibility } from "react-icons/md";
import toast from "react-hot-toast";
import { DataTable, InfoRow, PageHeader, SectionCard, StatusBadge } from "../../components/ui";
import { getMyInstructorActivities, getMyInstructorBranches, getMyInstructorDepartments, getMyInstructorProfile, getMyTeachingStudents, getTeachingStudentActivities, updateMyInstructorProfile } from "../../api/instructor.api";
import type { InstructorActivity, InstructorStudent } from "../../api/instructor.api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function Instructor() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<InstructorStudent | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", bio: "", qualification: "", specializations: "" });
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["instructor", "me"], queryFn: async () => (await getMyInstructorProfile()).data.data });
  const branchesQuery = useQuery({ queryKey: ["instructor", "me", "branches"], queryFn: async () => (await getMyInstructorBranches()).data.data });
  const departmentsQuery = useQuery({ queryKey: ["instructor", "me", "departments"], queryFn: async () => (await getMyInstructorDepartments()).data.data });
  const activitiesQuery = useQuery({ queryKey: ["instructor", "me", "activities"], queryFn: async () => (await getMyInstructorActivities()).data.data.items });
  const studentsQuery = useQuery({
    queryKey: ["instructor", "my-students", search],
    queryFn: async () => (await getMyTeachingStudents({ search: search.trim() || undefined, page: 1, limit: 100 })).data.data,
  });
  const studentActivityQuery = useQuery({
    queryKey: ["instructor", "student-activities", selectedStudent?.id],
    queryFn: async () => (await getTeachingStudentActivities(selectedStudent!.id)).data.data.items,
    enabled: Boolean(selectedStudent),
  });
  const updateMutation = useMutation({
    mutationFn: () => updateMyInstructorProfile({
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
      qualification: form.qualification.trim() || null,
      specializations: form.specializations.split(",").map((value) => value.trim()).filter(Boolean),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["instructor", "me"] });
      toast.success("Instructor profile updated");
      setEditOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const openEdit = () => {
    const profile = profileQuery.data;
    setForm({ phone: profile?.phone ?? "", bio: profile?.bio ?? "", qualification: profile?.qualification ?? "", specializations: profile?.specializations?.join(", ") ?? "" });
    setEditOpen(true);
  };
  const columns = useMemo<ColumnDef<InstructorStudent>[]>(() => [
    { id: "name", header: "Student", accessorFn: (student) => student.user?.name ?? "—", cell: ({ getValue }) => <Typography sx={{ fontWeight: 600 }}>{getValue<string>()}</Typography> },
    { accessorKey: "admissionNumber", header: "Admission no.", cell: ({ getValue }) => getValue<string>() || "—" },
    { id: "departments", header: "Department", accessorFn: (student) => student.memberships?.map((membership) => membership.department?.name).filter(Boolean).join(", ") || "—" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => {
      const status = getValue<string>() || "ACTIVE";
      const type = status === "ACTIVE" ? "success" : status === "PENDING_APPROVAL" ? "warning" : "default";
      return <StatusBadge label={status.replaceAll("_", " ")} type={type} />;
    } },
  ], []);
  const activityColumns = useMemo<ColumnDef<InstructorActivity>[]>(() => [
    { accessorKey: "type", header: "Activity", cell: ({ getValue }) => String(getValue() ?? "Activity").replaceAll("_", " ") },
    { accessorKey: "description", header: "Details", cell: ({ getValue }) => getValue<string>() || "—" },
    { accessorKey: "occurredAt", header: "Date", cell: ({ getValue }) => { const value = getValue<string>(); return value ? new Date(value).toLocaleString() : "—"; } },
  ], []);

  return <Box>
    <PageHeader title="Instructor" subtitle="Your profile, teaching assignments, students, and activity." actions={<Button variant="outlined" onClick={openEdit} disabled={!profileQuery.data}>Edit profile</Button>} />
    {(profileQuery.isError || branchesQuery.isError || departmentsQuery.isError) && <Alert severity="error" sx={{ mb: 2 }}>Some instructor details could not be loaded.</Alert>}
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}><SectionCard title="My profile" subtitle={profileQuery.data?.user?.name ?? "Instructor details"}>
        {profileQuery.isLoading ? <Typography color="text.secondary">Loading profile…</Typography> : profileQuery.data ? <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 2 }}>
          <InfoRow label="Email" value={profileQuery.data.user?.email} /><InfoRow label="Status" value={<StatusBadge label={(profileQuery.data.status ?? "UNKNOWN").replaceAll("_", " ")} type={profileQuery.data.status === "ACTIVE" ? "success" : "warning"} />} />
          <InfoRow label="Phone" value={profileQuery.data.phone} /><InfoRow label="Qualification" value={profileQuery.data.qualification} /><InfoRow label="Experience" value={profileQuery.data.experienceYears == null ? undefined : `${profileQuery.data.experienceYears} years`} /><InfoRow label="Specializations" value={profileQuery.data.specializations?.join(", ")} span />
        </Box> : <Typography color="text.secondary">Instructor profile unavailable.</Typography>}
      </SectionCard></Grid>
      <Grid size={{ xs: 12, md: 6 }}><SectionCard title="Teaching assignments" subtitle="Branches and departments assigned to you.">
        {branchesQuery.isLoading || departmentsQuery.isLoading ? <Typography color="text.secondary">Loading assignments…</Typography> : <Stack spacing={1}>
          {(branchesQuery.data ?? []).map((item) => <Typography key={item.id}>Branch: {item.branch?.name ?? "Assigned branch"}</Typography>)}
          {(departmentsQuery.data ?? []).map((item) => <Typography key={item.id}>Department: {item.department?.name ?? "Assigned department"}{item.branch?.name ? ` · ${item.branch.name}` : ""}</Typography>)}
          {!branchesQuery.data?.length && !departmentsQuery.data?.length && <Typography color="text.secondary">No active assignments.</Typography>}
        </Stack>}
      </SectionCard></Grid>
    </Grid>
    {studentsQuery.isError && <Alert severity="error" sx={{ mb: 2 }}>Could not load your students. Try refreshing the list.</Alert>}
    <TextField
      size="small"
      placeholder="Search students by name, email, or admission number"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      sx={{ mb: 2, width: { xs: "100%", sm: 420 } }}
      slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
    />
    <DataTable
      columns={columns}
      data={studentsQuery.data?.items ?? []}
      loading={studentsQuery.isLoading}
      error={studentsQuery.isError ? "Unable to load your students" : null}
      onRetry={() => void studentsQuery.refetch()}
      emptyTitle="No students assigned"
      emptyDescription="Students assigned to your branches and departments will appear here."
      emptyIcon={<MdSchool size={30} />}
      ariaLabel="Instructor student roster"
      rowActions={(student) => <IconButton aria-label={`View ${student.user?.name ?? "student"} activity`} onClick={() => setSelectedStudent(student)}><MdVisibility /></IconButton>}
    />
    <SectionCard title="My activity" subtitle="Recent actions recorded on your account." actions={<MdHistory size={20} />} disableContentPadding sx={{ mt: 2 }}>
      <DataTable columns={activityColumns} data={activitiesQuery.data ?? []} loading={activitiesQuery.isLoading} error={activitiesQuery.isError ? "Unable to load activity" : null} onRetry={() => void activitiesQuery.refetch()} emptyTitle="No activity yet" />
    </SectionCard>
    <Dialog open={Boolean(selectedStudent)} onClose={() => setSelectedStudent(null)} fullWidth maxWidth="md">
      <DialogTitle>{selectedStudent?.user?.name ?? "Student"} · Activity</DialogTitle>
      <DialogContent><DataTable columns={activityColumns} data={studentActivityQuery.data ?? []} loading={studentActivityQuery.isLoading} error={studentActivityQuery.isError ? "Unable to load student activity" : null} onRetry={() => void studentActivityQuery.refetch()} emptyTitle="No student activity" /></DialogContent>
      <DialogActions><Button onClick={() => setSelectedStudent(null)}>Close</Button></DialogActions>
    </Dialog>
    <Dialog open={editOpen} onClose={() => !updateMutation.isPending && setEditOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Edit instructor profile</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <TextField label="Qualification" value={form.qualification} onChange={(event) => setForm({ ...form, qualification: event.target.value })} />
        <TextField label="Specializations" helperText="Separate entries with commas" value={form.specializations} onChange={(event) => setForm({ ...form, specializations: event.target.value })} />
        <TextField label="Bio" multiline minRows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
      </Stack></DialogContent><DialogActions><Button onClick={() => setEditOpen(false)}>Cancel</Button><Button variant="contained" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>Save</Button></DialogActions>
    </Dialog>
  </Box>;
}
