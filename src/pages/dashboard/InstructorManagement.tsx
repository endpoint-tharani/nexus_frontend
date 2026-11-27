import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { MdAdd, MdCheck, MdEdit, MdLink, MdPersonOff } from "react-icons/md";
import toast from "react-hot-toast";
import { DataTable, PageHeader, StatusBadge } from "../../components/ui";
import { useMe } from "../../hooks/user";
import { useBranches } from "../../hooks/branch";
import { useDepartments } from "../../hooks/department";
import { approveInstructor, createInstructor, endInstructorBranch, endInstructorDepartment, getInstructor, getInstructorBranches, getInstructorDepartments, listInstructors, linkInstructorBranch, linkInstructorDepartment, rejectInstructor, setInstructorStatus, updateInstructor } from "../../api/instructor.api";
import type { InstructorProfile, InstructorRelation, InstructorStatus } from "../../api/instructor.api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function InstructorManagement() {
  const { data: me } = useMe();
  const { data: branches = [] } = useBranches();
  const [branchId, setBranchId] = useState("");
  const { data: departments = [] } = useDepartments({ branchId: branchId || undefined, enabled: Boolean(branchId) });
  const companyId = me?.company?.id ?? me?.companyId ?? "";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"invite" | "edit" | "assign" | null>(null);
  const [target, setTarget] = useState<InstructorProfile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", employeeCode: "", phone: "", qualification: "", bio: "", experienceYears: "", joiningDate: "", specializations: "" });
  const [linkBranchId, setLinkBranchId] = useState("");
  const [linkDepartmentId, setLinkDepartmentId] = useState("");
  const query = useQuery({ queryKey: ["instructors", companyId, search], queryFn: async () => (await listInstructors(companyId, { search: search.trim() || undefined, page: 1, limit: 100 })).data.data.items, enabled: Boolean(companyId) });
  const detailQuery = useQuery({ queryKey: ["instructors", target?.id, "detail"], queryFn: async () => (await getInstructor(companyId, target!.id)).data.data, enabled: Boolean(target && dialog === "edit" && companyId) });
  const branchQuery = useQuery({ queryKey: ["instructors", target?.id, "branches"], queryFn: async () => (await getInstructorBranches(companyId, target!.id)).data.data, enabled: Boolean(target && companyId) });
  const departmentQuery = useQuery({ queryKey: ["instructors", target?.id, "departments"], queryFn: async () => (await getInstructorDepartments(companyId, target!.id)).data.data, enabled: Boolean(target && companyId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["instructors", companyId] });
  const inviteMutation = useMutation({ mutationFn: () => createInstructor(companyId, { name: form.name.trim(), email: form.email.trim() }), onSuccess: () => { void refresh(); toast.success("Instructor invitation sent"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const editMutation = useMutation({ mutationFn: () => updateInstructor(companyId, target!.id, { employeeCode: form.employeeCode.trim() || null, phone: form.phone.trim() || null, qualification: form.qualification.trim() || null, bio: form.bio.trim() || null, experienceYears: form.experienceYears ? Number(form.experienceYears) : null, joiningDate: form.joiningDate || null, specializations: form.specializations.split(",").map((item) => item.trim()).filter(Boolean) }), onSuccess: () => { void refresh(); toast.success("Instructor updated"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const approveMutation = useMutation({ mutationFn: (instructorId: string) => approveInstructor(companyId, instructorId), onSuccess: () => { void refresh(); toast.success("Instructor approved"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const rejectMutation = useMutation({ mutationFn: (instructorId: string) => rejectInstructor(companyId, instructorId, "Rejected by administrator"), onSuccess: () => { void refresh(); toast.success("Instructor rejected"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const statusMutation = useMutation({ mutationFn: ({ instructorId, status }: { instructorId: string; status: Exclude<InstructorStatus, "PENDING_APPROVAL"> }) => setInstructorStatus(companyId, instructorId, status), onSuccess: () => { void refresh(); toast.success("Instructor status updated"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const addBranchMutation = useMutation({ mutationFn: () => linkInstructorBranch(companyId, target!.id, linkBranchId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["instructors", target?.id, "branches"] }); toast.success("Branch assigned"); setLinkBranchId(""); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const removeBranchMutation = useMutation({ mutationFn: (id: string) => endInstructorBranch(companyId, target!.id, id), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["instructors", target?.id, "branches"] }); void queryClient.invalidateQueries({ queryKey: ["instructors", target?.id, "departments"] }); toast.success("Branch assignment ended"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const addDepartmentMutation = useMutation({ mutationFn: () => linkInstructorDepartment(companyId, target!.id, linkBranchId, linkDepartmentId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["instructors", target?.id, "departments"] }); toast.success("Department assigned"); setLinkDepartmentId(""); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const removeDepartmentMutation = useMutation({ mutationFn: ({ branchId: selectedBranch, departmentId }: { branchId: string; departmentId: string }) => endInstructorDepartment(companyId, target!.id, selectedBranch, departmentId), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["instructors", target?.id, "departments"] }); toast.success("Department assignment ended"); }, onError: (error) => toast.error(getErrorMessage(error)) });

  const openInvite = () => { setForm({ name: "", email: "", employeeCode: "", phone: "", qualification: "", bio: "", experienceYears: "", joiningDate: "", specializations: "" }); setDialog("invite"); };
  const openManage = (instructor: InstructorProfile, mode: "edit" | "assign") => { setTarget(instructor); setForm({ name: instructor.user?.name ?? "", email: instructor.user?.email ?? "", employeeCode: instructor.employeeCode ?? "", phone: instructor.phone ?? "", qualification: instructor.qualification ?? "", bio: instructor.bio ?? "", experienceYears: instructor.experienceYears?.toString() ?? "", joiningDate: instructor.joiningDate?.slice(0, 10) ?? "", specializations: instructor.specializations?.join(", ") ?? "" }); setDialog(mode); setBranchId(""); setLinkBranchId(""); };
  const columns = useMemo<ColumnDef<InstructorProfile>[]>(() => [
    { id: "name", header: "Instructor", accessorFn: (row) => row.user?.name ?? "—", cell: ({ getValue }) => <Typography sx={{ fontWeight: 600 }}>{getValue<string>()}</Typography> },
    { id: "email", header: "Email", accessorFn: (row) => row.user?.email ?? "—" },
    { accessorKey: "employeeCode", header: "Employee code", cell: ({ getValue }) => getValue<string>() || "—" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => { const status = getValue<InstructorStatus>() ?? "PENDING_APPROVAL"; return <StatusBadge label={status.replaceAll("_", " ")} type={status === "ACTIVE" ? "success" : status === "PENDING_APPROVAL" ? "warning" : "default"} />; } },
  ], []);

  const rowActions = (instructor: InstructorProfile) => <Stack direction="row" spacing={0.25}>
    {instructor.status === "PENDING_APPROVAL" ? <><IconButton title="Approve" onClick={() => approveMutation.mutate(instructor.id)}><MdCheck /></IconButton><Button size="small" color="error" onClick={() => rejectMutation.mutate(instructor.id)}>Reject</Button></> : null}
    <IconButton title="Edit instructor" onClick={() => openManage(instructor, "edit")}><MdEdit /></IconButton>
    <IconButton title="Manage assignments" onClick={() => openManage(instructor, "assign")}><MdLink /></IconButton>
    {instructor.status === "ACTIVE" && <Button size="small" onClick={() => statusMutation.mutate({ instructorId: instructor.id, status: "SUSPENDED" })}><MdPersonOff /> Suspend</Button>}
    {instructor.status === "SUSPENDED" && <Button size="small" onClick={() => statusMutation.mutate({ instructorId: instructor.id, status: "ACTIVE" })}>Activate</Button>}
    {instructor.status === "INACTIVE" && <Button size="small" onClick={() => statusMutation.mutate({ instructorId: instructor.id, status: "ACTIVE" })}>Reactivate</Button>}
  </Stack>;

  return <Box>
    <PageHeader title="Instructor management" subtitle="Invite instructors, review approvals, and manage teaching assignments." actions={<Button variant="contained" startIcon={<MdAdd />} onClick={openInvite}>Invite instructor</Button>} />
    {query.isError && <Alert severity="error" sx={{ mb: 2 }}>Could not load instructors.</Alert>}
    <TextField size="small" placeholder="Search instructors" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ mb: 2, width: { xs: "100%", sm: 360 } }} />
    <DataTable columns={columns} data={query.data ?? []} loading={query.isLoading} error={query.isError ? "Unable to load instructors" : null} onRetry={() => void query.refetch()} emptyTitle="No instructors found" rowActions={rowActions} />

    <Dialog open={dialog === "invite"} onClose={() => setDialog(null)} fullWidth maxWidth="sm"><DialogTitle>Invite instructor</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Alert severity="info">The instructor accepts the emailed invitation, then an administrator approves the profile before sign-in and instructor tools are available.</Alert><TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Stack></DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" disabled={!form.name.trim() || !form.email.trim() || inviteMutation.isPending} onClick={() => inviteMutation.mutate()}>Send invitation</Button></DialogActions></Dialog>

    <Dialog open={dialog === "edit"} onClose={() => setDialog(null)} fullWidth maxWidth="sm"><DialogTitle>Edit instructor profile</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      {detailQuery.data && <Typography variant="caption" color="text.secondary">Instructor record · {detailQuery.data.id}</Typography>}
      <TextField label="Employee code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} /><TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><TextField label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /><TextField label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /><TextField label="Joining date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} /><TextField label="Specializations" helperText="Comma separated" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} /><TextField label="Bio" multiline minRows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
    </Stack></DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>Save</Button></DialogActions></Dialog>

    <Dialog open={dialog === "assign"} onClose={() => setDialog(null)} fullWidth maxWidth="md"><DialogTitle>Assignments · {target?.user?.name}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <Typography variant="subtitle2">Branches</Typography>{branchQuery.isLoading ? <Typography>Loading…</Typography> : (branchQuery.data ?? []).map((relation: InstructorRelation) => <Stack key={relation.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography>{relation.branch?.name ?? relation.branchId} · {relation.status}</Typography>{relation.status === "ACTIVE" && <Button size="small" color="error" onClick={() => removeBranchMutation.mutate(relation.branchId ?? "")}>End</Button>}</Stack>)}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField select fullWidth label="Add branch" value={linkBranchId} onChange={(e) => setLinkBranchId(e.target.value)}>{branches.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}</TextField><Button variant="outlined" disabled={!linkBranchId || addBranchMutation.isPending} onClick={() => addBranchMutation.mutate()}>Link branch</Button></Stack>
      <Typography variant="subtitle2">Departments</Typography>{departmentQuery.isLoading ? <Typography>Loading…</Typography> : (departmentQuery.data ?? []).map((relation: InstructorRelation) => <Stack key={relation.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography>{relation.department?.name ?? relation.departmentId} · {relation.branch?.name ?? relation.branchId} · {relation.status}</Typography>{relation.status === "ACTIVE" && <Button size="small" color="error" onClick={() => removeDepartmentMutation.mutate({ branchId: relation.branchId ?? "", departmentId: relation.departmentId ?? "" })}>End</Button>}</Stack>)}
      <TextField select label="Branch for department" value={branchId} onChange={(e) => { setBranchId(e.target.value); setLinkBranchId(e.target.value); setLinkDepartmentId(""); }}>{branches.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}</TextField><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField select fullWidth label="Add department" value={linkDepartmentId} onChange={(e) => setLinkDepartmentId(e.target.value)}>{departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}</TextField><Button variant="outlined" disabled={!branchId || !linkDepartmentId || addDepartmentMutation.isPending} onClick={() => addDepartmentMutation.mutate()}>Link department</Button></Stack>
    </Stack></DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
