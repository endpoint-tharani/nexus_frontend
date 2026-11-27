import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { MdAdd, MdCheck, MdHistory, MdPersonAdd, MdSearch } from "react-icons/md";
import toast from "react-hot-toast";
import { DataTable, PageHeader, StatusBadge } from "../../components/ui";
import { useMe } from "../../hooks/user";
import { useActiveBranch } from "../../hooks/branch";
import { useDepartments } from "../../hooks/department";
import { useStaff } from "../../hooks/company";
import { useCompany } from "../../hooks/company/useCompany";
import { addStudentDepartment, approveStudent, assignStudentStaff, createAdmissionCode, createStudent, endStudentDepartment, getStudent, getStudentActivities, listStudents, rejectStudent, replaceStudentDepartments, setStudentSelfRegistration, setStudentStatus, updateStudent } from "../../api/student.api";
import type { StudentActivity, StudentListParams, StudentSelfProfile } from "../../api/student.api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function StudentManagement() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const { branches, selectedBranchId } = useActiveBranch();
  const [dialog, setDialog] = useState<"create" | "edit" | "assign" | "code" | null>(null);
  const [studentBranchId, setStudentBranchId] = useState("");
  const { data: departments = [], isLoading: departmentsLoading, isError: departmentsError } = useDepartments({ branchId: studentBranchId || undefined, enabled: Boolean(studentBranchId && (dialog === "create" || dialog === "edit" || dialog === "assign")) });
  const { data: staff = [] } = useStaff();
  const { data: company } = useCompany();
  const companyId = me?.company?.id ?? me?.companyId ?? "";
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<StudentSelfProfile | null>(null);
  const [activityTarget, setActivityTarget] = useState<StudentSelfProfile | null>(null);
  const [lastCode, setLastCode] = useState<{ id?: string; code?: string } | null>(null);
  const [allowsSelfRegistration, setAllowsSelfRegistration] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", admissionNumber: "", phone: "", address: "", departmentIds: [] as string[], staffUserId: "", guardianName: "", guardianPhone: "" });
  const query = useQuery({
    queryKey: ["student-management", companyId, selectedBranchId, search],
    queryFn: async () => {
      const params: StudentListParams = { branchId: selectedBranchId || undefined, search: search.trim() || undefined, page: 1, limit: 100 };
      return (await listStudents(companyId, params)).data.data.items;
    },
    enabled: Boolean(companyId),
  });
  const activityQuery = useQuery({ queryKey: ["student-management", "activities", activityTarget?.id], queryFn: async () => (await getStudentActivities(companyId, activityTarget!.id)).data.data.items, enabled: Boolean(activityTarget && companyId) });
  const detailQuery = useQuery({ queryKey: ["student-management", "detail", target?.id], queryFn: async () => (await getStudent(companyId, target!.id)).data.data, enabled: Boolean(dialog === "edit" && target && companyId) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["student-management", companyId] });
  const createMutation = useMutation({ mutationFn: () => createStudent(companyId, { name: form.name.trim(), email: form.email.trim(), admissionNumber: form.admissionNumber.trim(), branchId: studentBranchId, departmentIds: form.departmentIds, phone: form.phone.trim() || undefined, address: form.address.trim() || undefined, guardianName: form.guardianName.trim() || undefined, guardianPhone: form.guardianPhone.trim() || undefined }), onSuccess: () => { void invalidate(); toast.success("Student created"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const updateMutation = useMutation({ mutationFn: () => updateStudent(companyId, target!.id, { name: form.name.trim(), phone: form.phone.trim() || null, address: form.address.trim() || null, guardianName: form.guardianName.trim() || null, guardianPhone: form.guardianPhone.trim() || null }), onSuccess: () => { void invalidate(); toast.success("Student updated"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const approveMutation = useMutation({ mutationFn: (student: StudentSelfProfile) => approveStudent(companyId, student.id), onSuccess: () => { void invalidate(); toast.success("Student approved"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const rejectMutation = useMutation({ mutationFn: (student: StudentSelfProfile) => rejectStudent(companyId, student.id, "Rejected by administrator"), onSuccess: () => { void invalidate(); toast.success("Student rejected"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const statusMutation = useMutation({ mutationFn: ({ student, status }: { student: StudentSelfProfile; status: "ACTIVE" | "SUSPENDED" | "INACTIVE" | "ARCHIVED" }) => setStudentStatus(companyId, student.id, status), onSuccess: () => { void invalidate(); toast.success("Student status updated"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const departmentsMutation = useMutation({ mutationFn: () => replaceStudentDepartments(companyId, target!.id, form.departmentIds), onSuccess: () => { void invalidate(); toast.success("Student departments updated"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const addDepartmentMutation = useMutation({ mutationFn: (departmentId: string) => addStudentDepartment(companyId, target!.id, departmentId), onSuccess: () => { void invalidate(); void queryClient.invalidateQueries({ queryKey: ["student-management", "detail", target?.id] }); toast.success("Department added"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const endDepartmentMutation = useMutation({ mutationFn: (departmentId: string) => endStudentDepartment(companyId, target!.id, departmentId), onSuccess: () => { void invalidate(); void queryClient.invalidateQueries({ queryKey: ["student-management", "detail", target?.id] }); toast.success("Department membership ended"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const assignMutation = useMutation({ mutationFn: () => assignStudentStaff(companyId, { userId: form.staffUserId, branchId: selectedBranchId, ...(form.departmentIds[0] ? { departmentId: form.departmentIds[0] } : {}) }), onSuccess: () => { toast.success("Instructor assigned"); setDialog(null); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const codeMutation = useMutation({ mutationFn: async () => createAdmissionCode(companyId, { branchId: selectedBranchId ?? "", maxUses: 25, expiresInDays: 7, allowsSelfRegistration, requiresApproval: true }), onSuccess: (response) => { setLastCode(response.data.data); toast.success("Admission code created"); }, onError: (error) => toast.error(getErrorMessage(error)) });
  const registrationMutation = useMutation({ mutationFn: (enabled: boolean) => setStudentSelfRegistration(companyId, enabled), onSuccess: async (_response, enabled) => { await queryClient.invalidateQueries({ queryKey: ["company", companyId] }); toast.success(`Student self-registration ${enabled ? "enabled" : "disabled"}`); }, onError: (error) => toast.error(getErrorMessage(error)) });

  const openCreate = () => { setTarget(null); setStudentBranchId(selectedBranchId || (branches.length === 1 ? branches[0].id : "")); setForm({ name: "", email: "", admissionNumber: "", phone: "", address: "", departmentIds: [], staffUserId: "", guardianName: "", guardianPhone: "" }); setDialog("create"); };
  const openEdit = (student: StudentSelfProfile) => { setTarget(student); setStudentBranchId(selectedBranchId || (branches.length === 1 ? branches[0].id : "")); setForm({ name: student.user?.name ?? "", email: student.user?.email ?? "", admissionNumber: student.admissionNumber ?? "", phone: student.phone ?? "", address: student.address ?? "", departmentIds: student.memberships?.filter((item) => item.status === "ACTIVE").map((item) => item.department?.id).filter((id): id is string => Boolean(id)) ?? [], staffUserId: "", guardianName: student.guardianName ?? "", guardianPhone: student.guardianPhone ?? "" }); setDialog("edit"); };
  const columns = useMemo<ColumnDef<StudentSelfProfile>[]>(() => [
    { id: "name", header: "Student", accessorFn: (row) => row.user?.name ?? "—", cell: ({ getValue }) => <Typography sx={{ fontWeight: 600 }}>{getValue<string>()}</Typography> },
    { accessorKey: "admissionNumber", header: "Admission no.", cell: ({ getValue }) => getValue<string>() || "—" },
    { id: "email", header: "Email", accessorFn: (row) => row.user?.email ?? "—" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge label={(getValue<string>() ?? "UNKNOWN").replaceAll("_", " ")} type={getValue<string>() === "ACTIVE" ? "success" : "warning"} /> },
  ], []);
  const activitiesColumns = useMemo<ColumnDef<StudentActivity>[]>(() => [
    { accessorKey: "type", header: "Activity", cell: ({ getValue }) => String(getValue() ?? "Activity").replaceAll("_", " ") },
    { accessorKey: "description", header: "Details", cell: ({ getValue }) => getValue<string>() || "—" },
    { accessorKey: "occurredAt", header: "Date", cell: ({ getValue }) => { const value = getValue<string>(); return value ? new Date(value).toLocaleString() : "—"; } },
  ], []);

  return <Box>
    <PageHeader title="Student management" subtitle="Create and manage student records, approvals, and instructor assignments." actions={<><Button variant="outlined" onClick={() => registrationMutation.mutate(true)} disabled={company?.studentSelfRegistrationEnabled || registrationMutation.isPending}>Enable self-registration</Button><Button variant="outlined" onClick={() => registrationMutation.mutate(false)} disabled={!company?.studentSelfRegistrationEnabled || registrationMutation.isPending}>Disable self-registration</Button><Button variant="outlined" startIcon={<MdPersonAdd />} onClick={() => { setStudentBranchId(selectedBranchId); setDialog("assign"); }} disabled={!selectedBranchId}>Assign instructor</Button><Button variant="outlined" startIcon={<MdCheck />} onClick={() => { setLastCode(null); setAllowsSelfRegistration(false); setDialog("code"); }} disabled={!selectedBranchId}>Admission code</Button><Button variant="contained" startIcon={<MdAdd />} onClick={openCreate} disabled={!selectedBranchId}>Add student</Button></>} />
    {!selectedBranchId && <Alert severity="info" sx={{ mb: 2 }}>Choose a branch to manage its students.</Alert>}
    <TextField size="small" placeholder="Search students" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ mb: 2, width: { xs: "100%", sm: 360 } }} slotProps={{ input: { startAdornment: <MdSearch /> } }} />
    <DataTable columns={columns} data={query.data ?? []} loading={query.isLoading} error={query.isError ? "Unable to load students" : null} onRetry={() => void query.refetch()} emptyTitle="No students found" rowActions={(student) => <Stack direction="row" spacing={0.25}>
      {student.status === "PENDING_APPROVAL" && <IconButton title="Approve" onClick={() => approveMutation.mutate(student)}><MdCheck /></IconButton>}
      {student.status === "PENDING_APPROVAL" && <Button size="small" color="error" onClick={() => rejectMutation.mutate(student)}>Reject</Button>}
      <IconButton title="Edit departments and profile" onClick={() => openEdit(student)}><MdPersonAdd /></IconButton>
      <IconButton title="View activity" onClick={() => setActivityTarget(student)}><MdHistory /></IconButton>
      {student.status === "ACTIVE" && <Button size="small" onClick={() => statusMutation.mutate({ student, status: "SUSPENDED" })}>Suspend</Button>}
      {student.status === "SUSPENDED" && <Button size="small" onClick={() => statusMutation.mutate({ student, status: "ACTIVE" })}>Activate</Button>}
    </Stack>} />
    <Dialog open={dialog === "create" || dialog === "edit"} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
      <DialogTitle>{dialog === "create" ? "Add student" : "Edit student"}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        {dialog === "edit" && detailQuery.isLoading && <Typography color="text.secondary">Loading latest student record…</Typography>}
        {dialog === "edit" && detailQuery.data?.user?.email && <Typography variant="body2" color="text.secondary">{detailQuery.data.user.email} · {detailQuery.data.admissionNumber}</Typography>}
        <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        {dialog === "create" && <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />}
        {dialog === "create" && <TextField label="Admission number" value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} required />}
        <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <TextField label="Guardian name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
        <TextField label="Guardian phone" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
        <TextField select label="Departments" disabled={!studentBranchId || departmentsLoading || departmentsError} helperText={departmentsError ? "Could not load departments. Close and reopen the form to retry." : departmentsLoading ? "Loading departments…" : !studentBranchId ? "Select a branch to load departments." : departments.length === 0 ? "No departments are set up for this branch." : "Select one or more departments."} slotProps={{ select: { multiple: true } }} value={form.departmentIds} onChange={(e) => { const value = e.target.value; setForm({ ...form, departmentIds: typeof value === "string" ? value.split(",") : value }); }}>{departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}</TextField>
        {dialog === "edit" && target && <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}><Button size="small" disabled={!form.departmentIds.length} onClick={() => addDepartmentMutation.mutate(form.departmentIds[0])}>Add selected department</Button>{(detailQuery.data?.memberships ?? []).filter((membership) => membership.status === "ACTIVE" && membership.department?.id).map((membership) => <Button key={membership.id} size="small" color="error" onClick={() => endDepartmentMutation.mutate(membership.department!.id!)}>End {membership.department?.name}</Button>)}</Stack>}
      </Stack>{dialog === "create" && <Alert severity="info" sx={{ mt: 2 }}>A setup code will be emailed to the student. They must set a password at <strong>/student-setup</strong> before signing in.</Alert>}</DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" disabled={!form.name.trim() || (dialog === "create" && (!studentBranchId || !form.email.trim() || !form.admissionNumber.trim()))} onClick={() => dialog === "create" ? createMutation.mutate() : (updateMutation.mutate(), departmentsMutation.mutate())}>{dialog === "create" ? "Create" : "Save"}</Button></DialogActions>
    </Dialog>
    <Dialog open={dialog === "assign"} onClose={() => setDialog(null)} fullWidth maxWidth="sm"><DialogTitle>Assign instructor</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField select label="Instructor" value={form.staffUserId} onChange={(e) => setForm({ ...form, staffUserId: e.target.value })}>{staff.filter((person) => person.role === "INSTRUCTOR").map((person) => <MenuItem key={person.id} value={person.id}>{person.name} · {person.email}</MenuItem>)}</TextField><TextField select label="Department (optional)" value={form.departmentIds[0] ?? ""} onChange={(e) => setForm({ ...form, departmentIds: e.target.value ? [e.target.value] : [] })}><MenuItem value="">All branch students</MenuItem>{departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}</TextField></Stack></DialogContent><DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" disabled={!form.staffUserId} onClick={() => assignMutation.mutate()}>Assign</Button></DialogActions></Dialog>
    <Dialog open={dialog === "code"} onClose={() => setDialog(null)}><DialogTitle>Student admission code</DialogTitle><DialogContent>{lastCode?.code ? <Alert severity="success">Code: <strong>{lastCode.code}</strong></Alert> : <Stack spacing={1.5} sx={{ pt: 1 }}><Typography>Generate a branch-scoped code for up to 25 students. It expires in 7 days and requires administrator approval.</Typography><FormControlLabel control={<Switch checked={allowsSelfRegistration} onChange={(event) => setAllowsSelfRegistration(event.target.checked)} />} label="Require organization self-registration to be enabled" />{allowsSelfRegistration && !company?.studentSelfRegistrationEnabled && <Alert severity="warning">Organization self-registration is off. Enable it before students can use this code.</Alert>}</Stack>}</DialogContent><DialogActions>{lastCode?.id && <Button color="error" onClick={() => toast.promise(import("../../api/student.api").then(({ revokeAdmissionCode }) => revokeAdmissionCode(companyId, lastCode.id!)), { loading: "Revoking…", success: "Code revoked", error: (error) => getErrorMessage(error) })}>Revoke</Button>}<Button onClick={() => setDialog(null)}>Close</Button>{!lastCode?.code && <Button variant="contained" disabled={codeMutation.isPending || (allowsSelfRegistration && !company?.studentSelfRegistrationEnabled)} onClick={() => codeMutation.mutate()}>Generate</Button>}</DialogActions></Dialog>
    <Dialog open={Boolean(activityTarget)} onClose={() => setActivityTarget(null)} fullWidth maxWidth="md"><DialogTitle>{activityTarget?.user?.name ?? "Student"} · Activity</DialogTitle><DialogContent><DataTable columns={activitiesColumns} data={activityQuery.data ?? []} loading={activityQuery.isLoading} error={activityQuery.isError ? "Unable to load activity" : null} onRetry={() => void activityQuery.refetch()} emptyTitle="No activity yet" /></DialogContent><DialogActions><Button onClick={() => setActivityTarget(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
